export const financeiroSheetScript = `
/**
 * Script para integração com planilha de Financeiro
 * 
 * IMPORTANTE: Este script deve ser salvo no Apps Script da planilha e publicado como aplicativo web
 * com acesso para "Qualquer pessoa, mesmo anônima"
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // Configurar resposta JSON
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Verificar se a solicitação veio de um iframe
  var isIframe = e && e.parameter && e.parameter._iframe;
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Criar ou obter a única sheet de Transações
    var transactionsSheet = ss.getSheetByName('Transacoes');
    if (!transactionsSheet) {
      transactionsSheet = ss.insertSheet('Transacoes');
      
      var headers = [
        'ID', 'Data', 'Tipo', 'Descrição', 'Categoria', 
        'Valor', 'Método de Pagamento', 'Cliente', 'ClienteID',
        'Produtos', 'ProdutoIDs', 'Status', 'Notas', 
        'Reembolsável', 'Transação Relacionada'
      ];
      transactionsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Formatar cabeçalhos
      transactionsSheet.getRange(1, 1, 1, headers.length)
        .setBackground('#4285f4')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }
    
    var action = e && e.parameter ? e.parameter.action : null;
    var result = {};
    
    // Log da ação para debugging
    Logger.log('Ação recebida: ' + action);
    
    // Verificar se está online
    if (!action) {
      result = {
        success: true,
        message: "O serviço Financeiro está online e pronto para receber dados."
      };
    }
    
    // Exportar transações para a planilha
    else if (action === 'exportTransactions' && e.postData) {
      var data;
      
      // Verificar se os dados foram enviados via form ou direct JSON
      if (e.parameter.data) {
        data = JSON.parse(e.parameter.data);
      } else {
        data = JSON.parse(e.postData.contents);
      }
      
      var transactions = data.transactions;
      
      Logger.log('Exportando ' + transactions.length + ' transações');
      
      // Limpar dados existentes (exceto cabeçalhos)
      if (transactionsSheet.getLastRow() > 1) {
        transactionsSheet.getRange(2, 1, transactionsSheet.getLastRow() - 1, transactionsSheet.getLastColumn()).clear();
      }
      
      // Adicionar novos dados
      if (transactions && transactions.length > 0) {
        var values = transactions.map(function(t) {
          return [
            t.id,
            t.date,
            t.type,
            t.description,
            t.category,
            t.amount,
            t.paymentMethod || '',
            t.customer || '',
            t.customerId || '',
            (t.products || []).join(', '),
            (t.productIds || []).join(', '),
            t.status || 'completed',
            t.notes || '',
            t.isRefundable ? 'Sim' : 'Não',
            t.relatedTransactionId || ''
          ];
        });
        
        transactionsSheet.getRange(2, 1, values.length, values[0].length).setValues(values);
        
        // Formatar colunas
        transactionsSheet.autoResizeColumns(1, values[0].length);
      }
      
      result = {
        success: true,
        message: 'Transações exportadas com sucesso!'
      };
    }
    
    // Importar transações da planilha
    else if (action === 'importTransactions') {
      var dataRange = transactionsSheet.getDataRange();
      var values = dataRange.getValues();
      
      Logger.log('Importando transações da planilha');
      
      if (values.length <= 1) {
        result = {
          success: true,
          data: []
        };
      } else {
        var headers = values[0];
        var transactions = [];
        
        for (var i = 1; i < values.length; i++) {
          var row = values[i];
          var transaction = {};
          
          // Mapear dados da planilha para objeto transaction
          transaction.id = row[0];
          transaction.date = row[1];
          transaction.type = row[2];
          transaction.description = row[3];
          transaction.category = row[4];
          transaction.amount = Number(row[5]);
          transaction.paymentMethod = row[6];
          transaction.customer = row[7];
          transaction.customerId = row[8];
          transaction.products = row[9] ? row[9].split(', ') : [];
          transaction.productIds = row[10] ? row[10].split(', ') : [];
          transaction.status = row[11];
          transaction.notes = row[12];
          transaction.isRefundable = row[13] === 'Sim';
          transaction.relatedTransactionId = row[14];
          
          transactions.push(transaction);
        }
        
        result = {
          success: true,
          data: transactions
        };
      }
    }
    
    // Sincronizar todas as transações
    else if (action === 'syncTransactions' && e.postData) {
      var data;
      
      // Verificar se os dados foram enviados via form ou direct JSON
      if (e.parameter.data) {
        data = JSON.parse(e.parameter.data);
      } else {
        data = JSON.parse(e.postData.contents);
      }
      
      var transactions = data.transactions;
      
      Logger.log('Sincronizando ' + transactions.length + ' transações');
      
      // Implementar sincronização bidirecional
      // 1. Obter dados existentes da planilha
      var dataRange = transactionsSheet.getDataRange();
      var values = dataRange.getValues();
      var headers = values[0];
      var sheetTransactions = [];
      
      if (values.length > 1) {
        for (var i = 1; i < values.length; i++) {
          var row = values[i];
          sheetTransactions.push({
            id: row[0],
            date: row[1],
            type: row[2],
            description: row[3],
            category: row[4],
            amount: Number(row[5]),
            paymentMethod: row[6],
            customer: row[7],
            customerId: row[8],
            products: row[9] ? row[9].split(', ') : [],
            productIds: row[10] ? row[10].split(', ') : [],
            status: row[11],
            notes: row[12],
            isRefundable: row[13] === 'Sim',
            relatedTransactionId: row[14]
          });
        }
      }
      
      // 2. Mesclar dados do app com dados da planilha
      var mergedTransactions = mergeTransactions(transactions, sheetTransactions);
      
      // 3. Limpar dados existentes e exportar dados mesclados
      if (transactionsSheet.getLastRow() > 1) {
        transactionsSheet.getRange(2, 1, transactionsSheet.getLastRow() - 1, transactionsSheet.getLastColumn()).clear();
      }
      
      if (mergedTransactions.length > 0) {
        var values = mergedTransactions.map(function(t) {
          return [
            t.id,
            t.date,
            t.type,
            t.description,
            t.category,
            t.amount,
            t.paymentMethod || '',
            t.customer || '',
            t.customerId || '',
            (t.products || []).join(', '),
            (t.productIds || []).join(', '),
            t.status || 'completed',
            t.notes || '',
            t.isRefundable ? 'Sim' : 'Não',
            t.relatedTransactionId || ''
          ];
        });
        
        transactionsSheet.getRange(2, 1, values.length, values[0].length).setValues(values);
        transactionsSheet.autoResizeColumns(1, values[0].length);
      }
      
      result = {
        success: true,
        message: 'Transações sincronizadas com sucesso!'
      };
    }
    
    else {
      result = {
        success: false,
        error: 'Ação inválida ou dados ausentes'
      };
    }
    
    var jsonOutput;
    if (isIframe) {
      // Para solicitações de iframe, precisamos enviar uma resposta que inclua script para postMessage
      var iframeId = e.parameter._iframe;
      var responseHtml = '<html><body><script>window.parent.postMessage(' + 
                         JSON.stringify({ 
                           iframeId: iframeId, 
                           data: result 
                         }) + 
                         ', "*");</script></body></html>';
                         
      return HtmlService.createHtmlOutput(responseHtml);
    } else {
      // Para solicitações normais, enviar resposta JSON
      return output.setContent(JSON.stringify(result));
    }
    
  } catch (error) {
    Logger.log('Erro: ' + error.toString());
    
    if (isIframe) {
      // Para solicitações de iframe, enviar erro via postMessage
      var iframeId = e.parameter._iframe;
      var responseHtml = '<html><body><script>window.parent.postMessage(' + 
                         JSON.stringify({ 
                           iframeId: iframeId, 
                           error: error.toString() 
                         }) + 
                         ', "*");</script></body></html>';
                         
      return HtmlService.createHtmlOutput(responseHtml);
    } else {
      // Para solicitações normais, enviar erro como JSON
      return output.setContent(JSON.stringify({
        success: false,
        error: error.toString()
      }));
    }
  }
}

// Função para mesclar transações do app com transações da planilha
function mergeTransactions(appTransactions, sheetTransactions) {
  var mergedMap = {};
  
  // Adicionar todas as transações do app ao mapa
  appTransactions.forEach(function(transaction) {
    mergedMap[transaction.id] = transaction;
  });
  
  // Adicionar/atualizar transações da planilha
  sheetTransactions.forEach(function(transaction) {
    // Se a transação não existe no app, adicionar
    if (!mergedMap[transaction.id]) {
      mergedMap[transaction.id] = transaction;
    }
    // Se a transação existe em ambos, usar a versão mais recente baseado numa heurística
    // (por exemplo, comparar campos específicos para decidir qual versão manter)
  });
  
  // Converter o mapa de volta para um array
  var mergedArray = [];
  for (var id in mergedMap) {
    if (mergedMap.hasOwnProperty(id)) {
      mergedArray.push(mergedMap[id]);
    }
  }
  
  return mergedArray;
}
`;

export const clientesSheetScript = `
/**
 * Script para integração com planilha de Clientes
 * 
 * IMPORTANTE: Este script deve ser salvo no Apps Script da planilha e publicado como aplicativo web
 * com acesso para "Qualquer pessoa, mesmo anônima"
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // Configurar resposta JSON
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Verificar se a solicitação veio de um iframe
  var isIframe = e && e.parameter && e.parameter._iframe;
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Criar ou obter a única sheet de Clientes
    var clientsSheet = ss.getSheetByName('Clientes');
    if (!clientsSheet) {
      clientsSheet = ss.insertSheet('Clientes');
      
      var clientHeaders = [
        'ID', 'Nome', 'Email', 'Telefone', 'Endereço',
        'Data Cadastro', 'Total Compras', 'Última Compra',
        'Observações', 'Status', 'CPF/CNPJ', 'Categoria'
      ];
      clientsSheet.getRange(1, 1, 1, clientHeaders.length).setValues([clientHeaders]);
      
      // Formatar cabeçalhos
      clientsSheet.getRange(1, 1, 1, clientHeaders.length)
        .setBackground('#4285f4')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }
    
    var action = e && e.parameter ? e.parameter.action : null;
    var result = {};
    
    // Log da ação para debugging
    Logger.log('Ação recebida: ' + action);
    
    // Verificar se está online
    if (!action) {
      result = {
        success: true,
        message: "O serviço Clientes está online e pronto para receber dados."
      };
    }
    
    // Exportar clientes para a planilha
    else if (action === 'exportCustomers' && e.postData) {
      var data;
      
      // Verificar se os dados foram enviados via form ou direct JSON
      if (e.parameter.data) {
        data = JSON.parse(e.parameter.data);
      } else {
        data = JSON.parse(e.postData.contents);
      }
      
      var customers = data.customers;
      
      Logger.log('Exportando ' + customers.length + ' clientes');
      
      // Limpar dados existentes (exceto cabeçalhos)
      if (clientsSheet.getLastRow() > 1) {
        clientsSheet.getRange(2, 1, clientsSheet.getLastRow() - 1, clientsSheet.getLastColumn()).clear();
      }
      
      // Adicionar novos dados
      if (customers && customers.length > 0) {
        var values = customers.map(function(c) {
          return [
            c.id,
            c.name,
            c.email,
            c.phone,
            c.address || '',
            c.joinDate,
            c.totalPurchases,
            c.lastPurchase || '',
            c.notes || '',
            c.status,
            c.document || '',
            c.category || 'regular'
          ];
        });
        
        clientsSheet.getRange(2, 1, values.length, values[0].length).setValues(values);
        
        // Formatar colunas
        clientsSheet.autoResizeColumns(1, values[0].length);
      }
      
      result = {
        success: true,
        message: 'Clientes exportados com sucesso!'
      };
    }
    
    // Importar clientes da planilha
    else if (action === 'importCustomers') {
      var dataRange = clientsSheet.getDataRange();
      var values = dataRange.getValues();
      
      Logger.log('Importando clientes da planilha');
      
      if (values.length <= 1) {
        result = {
          success: true,
          data: []
        };
      } else {
        var headers = values[0];
        var customers = [];
        
        for (var i = 1; i < values.length; i++) {
          var row = values[i];
          var customer = {};
          
          // Mapear dados da planilha para objeto customer
          customer.id = row[0];
          customer.name = row[1];
          customer.email = row[2];
          customer.phone = row[3];
          customer.address = row[4];
          customer.joinDate = row[5];
          customer.totalPurchases = Number(row[6]);
          customer.lastPurchase = row[7];
          customer.notes = row[8];
          customer.status = row[9];
          customer.document = row[10];
          customer.category = row[11];
          
          customers.push(customer);
        }
        
        result = {
          success: true,
          data: customers
        };
      }
    }
    
    // Sincronizar todos os clientes
    else if (action === 'syncCustomers' && e.postData) {
      var data;
      
      // Verificar se os dados foram enviados via form ou direct JSON
      if (e.parameter.data) {
        data = JSON.parse(e.parameter.data);
      } else {
        data = JSON.parse(e.postData.contents);
      }
      
      var customers = data.customers;
      
      Logger.log('Sincronizando ' + customers.length + ' clientes');
      
      // Implementar sincronização bidirecional
      // 1. Obter dados existentes da planilha
      var dataRange = clientsSheet.getDataRange();
      var values = dataRange.getValues();
      var headers = values[0];
      var sheetCustomers = [];
      
      if (values.length > 1) {
        for (var i = 1; i < values.length; i++) {
          var row = values[i];
          sheetCustomers.push({
            id: row[0],
            name: row[1],
            email: row[2],
            phone: row[3],
            address: row[4],
            joinDate: row[5],
            totalPurchases: Number(row[6]),
            lastPurchase: row[7],
            notes: row[8],
            status: row[9],
            document: row[10],
            category: row[11]
          });
        }
      }
      
      // 2. Mesclar dados do app com dados da planilha
      var mergedCustomers = mergeCustomers(customers, sheetCustomers);
      
      // 3. Limpar dados existentes e exportar dados mesclados
      if (clientsSheet.getLastRow() > 1) {
        clientsSheet.getRange(2, 1, clientsSheet.getLastRow() - 1, clientsSheet.getLastColumn()).clear();
      }
      
      if (mergedCustomers.length > 0) {
        var values = mergedCustomers.map(function(c) {
          return [
            c.id,
            c.name,
            c.email,
            c.phone,
            c.address || '',
            c.joinDate,
            c.totalPurchases,
            c.lastPurchase || '',
            c.notes || '',
            c.status,
            c.document || '',
            c.category || 'regular'
          ];
        });
        
        clientsSheet.getRange(2, 1, values.length, values[0].length).setValues(values);
        clientsSheet.autoResizeColumns(1, values[0].length);
      }
      
      result = {
        success: true,
        message: 'Clientes sincronizados com sucesso!'
      };
    }
    
    else {
      result = {
        success: false,
        error: 'Ação inválida ou dados ausentes'
      };
    }
    
    var jsonOutput;
    if (isIframe) {
      // Para solicitações de iframe, precisamos enviar uma resposta que inclua script para postMessage
      var iframeId = e.parameter._iframe;
      var responseHtml = '<html><body><script>window.parent.postMessage(' + 
                         JSON.stringify({ 
                           iframeId: iframeId, 
                           data: result 
                         }) + 
                         ', "*");</script></body></html>';
                         
      return HtmlService.createHtmlOutput(responseHtml);
    } else {
      // Para solicitações normais, enviar resposta JSON
      return output.setContent(JSON.stringify(result));
    }
    
  } catch (error) {
    Logger.log('Erro: ' + error.toString());
    
    if (isIframe) {
      // Para solicitações de iframe, enviar erro via postMessage
      var iframeId = e.parameter._iframe;
      var responseHtml = '<html><body><script>window.parent.postMessage(' + 
                         JSON.stringify({ 
                           iframeId: iframeId, 
                           error: error.toString() 
                         }) + 
                         ', "*");</script></body></html>';
                         
      return HtmlService.createHtmlOutput(responseHtml);
    } else {
      // Para solicitações normais, enviar erro como JSON
      return output.setContent(JSON.stringify({
        success: false,
        error: error.toString()
      }));
    }
  }
}

// Função para mesclar clientes do app com clientes da planilha
function mergeCustomers(appCustomers, sheetCustomers) {
  var mergedMap = {};
  
  // Adicionar todos os clientes do app ao mapa
  appCustomers.forEach(function(customer) {
    mergedMap[customer.id] = customer;
  });
  
  // Adicionar/atualizar clientes da planilha
  sheetCustomers.forEach(function(customer) {
    // Se o cliente não existe no app, adicionar
    if (!mergedMap[customer.id]) {
      mergedMap[customer.id] = customer;
    }
    // Se o cliente existe em ambos, usar a versão mais recente baseado numa heurística
    // (por exemplo, comparar campos específicos para decidir qual versão manter)
  });
  
  // Converter o mapa de volta para um array
  var mergedArray = [];
  for (var id in mergedMap) {
    if (mergedMap.hasOwnProperty(id)) {
      mergedArray.push(mergedMap[id]);
    }
  }
  
  return mergedArray;
}
`;

export const operacoesSheetScript = `
/**
 * Script para integração com planilha de Operações
 * 
 * IMPORTANTE: Este script deve ser salvo no Apps Script da planilha e publicado como aplicativo web
 * com acesso para "Qualquer pessoa, mesmo anônima"
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // Configurar resposta JSON
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Verificar se a solicitação veio de um iframe
  var isIframe = e && e.parameter && e.parameter._iframe;
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Criar ou obter a única sheet de Produtos
    var productsSheet = ss.getSheetByName('Produtos');
    if (!productsSheet) {
      productsSheet = ss.insertSheet('Produtos');
      
      var productHeaders = [
        'ID', 'Nome', 'Descrição', 'Preço', 'Custo',
        'Estoque', 'Categoria', 'Estoque Mínimo',
        'Fornecedor', 'Código de Barras', 'Data Cadastro'
      ];
      productsSheet.getRange(1, 1, 1, productHeaders.length).setValues([productHeaders]);
      
      // Formatar cabeçalhos
      productsSheet.getRange(1, 1, 1, productHeaders.length)
        .setBackground('#4285f4')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }
    
    // Criar ou obter a única sheet de Fornecedores
    var suppliersSheet = ss.getSheetByName('Fornecedores');
    if (!suppliersSheet) {
      suppliersSheet = ss.insertSheet('Fornecedores');
      
      var supplierHeaders = [
        'ID', 'Nome', 'Contato', 'Email', 'Telefone',
        'Endereço', 'Produtos', 'CNPJ', 'Categoria'
      ];
      suppliersSheet.getRange(1, 1, 1, supplierHeaders.length).setValues([supplierHeaders]);
      
      // Formatar cabeçalhos
      suppliersSheet.getRange(1, 1, 1, supplierHeaders.length)
        .setBackground('#4285f4')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }
    
    var action = e && e.parameter ? e.parameter.action : null;
    var result = {};
    
    // Log da ação para debugging
    Logger.log('Ação recebida: ' + action);
    
    // Verificar se está online
    if (!action) {
      result = {
        success: true,
        message: "O serviço Operações está online e pronto para receber dados."
      };
    }
    
    // Exportar produtos para a planilha
    else if (action === 'exportProducts' && e.postData) {
      var data;
      
      // Verificar se os dados foram enviados via form ou direct JSON
      if (e.parameter.data) {
        data = JSON.parse(e.parameter.data);
      } else {
        data = JSON.parse(e.postData.contents);
      }
      
      var products = data.products;
      
      Logger.log('Exportando ' + products.length + ' produtos');
      
      // Limpar dados existentes (exceto cabeçalhos)
      if (productsSheet.getLastRow() > 1) {
        productsSheet.getRange(2, 1, productsSheet.getLastRow() - 1, productsSheet.getLastColumn()).clear();
      }
      
      // Adicionar novos dados
      if (products && products.length > 0) {
        var values = products.map(function(p) {
          return [
            p.id,
            p.name,
            p.description || '',
            p.price,
            p.cost || 0,
            p.stock,
            p.category,
            p.minimumStock || 10,
            p.supplier || '',
            p.barcode || '',
            p.createdAt || new Date().toISOString().split('T')[0]
          ];
        });
        
        productsSheet.getRange(2, 1, values.length, values[0].length).setValues(values);
        
        // Formatar colunas
        productsSheet.autoResizeColumns(1, values[0].length);
      }
      
      result = {
        success: true,
        message: 'Produtos exportados com sucesso!'
      };
    }
    
    // Importar operações da planilha
    else if (action === 'importOperations') {
      // Importar produtos
      var productsDataRange = productsSheet.getDataRange();
      var productsValues = productsDataRange.getValues();
      var products = [];
      
      Logger.log('Importando produtos e fornecedores da planilha');
      
      if (productsValues.length > 1) {
        var productHeaders = productsValues[0];
        
        for (var i = 1; i < productsValues.length; i++) {
          var row = productsValues[i];
          var product = {
            id: row[0],
            name: row[1],
            description: row[2],
            price: Number(row[3]),
            cost: Number(row[4]),
            stock: Number(row[5]),
            category: row[6],
            minimumStock: Number(row[7]),
            supplier: row[8],
            barcode: row[9],
            createdAt: row[10]
          };
          
          products.push(product);
        }
      }
      
      // Importar fornecedores
      var suppliersDataRange = suppliersSheet.getDataRange();
      var suppliersValues = suppliersDataRange.getValues();
      var suppliers = [];
      
      if (suppliersValues.length > 1) {
        var supplierHeaders = suppliersValues[0];
        
        for (var i = 1; i < suppliersValues.length; i++) {
          var row = suppliersValues[i];
          var supplier = {
            id: row[0],
            name: row[1],
            contactName: row[2],
            email: row[3],
            phone: row[4],
            address: row[5],
            products: row[6] ? row[6].split(', ') : [],
            document: row[7],
            category: row[8]
          };
          
          suppliers.push(supplier);
        }
      }
      
      result = {
        success: true,
        data: {
          products: products,
          suppliers: suppliers
        }
      };
    }
    
    // Sincronizar operações (produtos e fornecedores)
    else if (action === 'syncOperations' && e.postData) {
      var data;
      
      // Verificar se os dados foram enviados via form ou direct JSON
      if (e.parameter.data) {
        data = JSON.parse(e.parameter.data);
      } else {
        data = JSON.parse(e.postData.contents);
      }
      
      var products = data.products;
      var suppliers = data.suppliers;
      
      Logger.log('Sincronizando ' + products.length + ' produtos e ' + suppliers.length + ' fornecedores');
      
      // Sincronizar produtos
      if (products && products.length > 0) {
        // 1. Obter dados existentes da planilha de produtos
        var productsDataRange = productsSheet.getDataRange();
        var productsValues = productsDataRange.getValues();
        var productHeaders = productsValues[0];
        var sheetProducts = [];
        
        if (productsValues.length > 1) {
          for (var i = 1; i < productsValues.length; i++) {
            var row = productsValues[i];
            sheetProducts.push({
              id: row[0],
              name: row[1],
              description: row[2],
              price: Number(row[3]),
              cost: Number(row[4]),
              stock: Number(row[5]),
              category: row[6],
              minimumStock: Number(row[7]),
              supplier: row[8],
              barcode: row[9],
              createdAt: row[10]
            });
          }
        }
        
        // 2. Mesclar dados do app com dados da planilha
        var mergedProducts = mergeProducts(products, sheetProducts);
        
        // 3. Limpar dados existentes e exportar dados mesclados
        if (productsSheet.getLastRow() > 1) {
          productsSheet.getRange(2, 1, productsSheet.getLastRow() - 1, productsSheet.getLastColumn()).clear();
        }
        
        if (mergedProducts.length > 0) {
          var productValues = mergedProducts.map(function(p) {
            return [
              p.id,
              p.name,
              p.description || '',
              p.price,
              p.cost || 0,
              p.stock,
              p.category,
              p.minimumStock || 10,
              p.supplier || '',
              p.barcode || '',
              p.createdAt || new Date().toISOString().split('T')[0]
            ];
          });
          
          productsSheet.getRange(2, 1, productValues.length, productValues[0].length).setValues(productValues);
          productsSheet.autoResizeColumns(1, productValues[0].length);
        }
      }
      
      // Sincronizar fornecedores
      if (suppliers && suppliers.length > 0) {
        // 1. Obter dados existentes da planilha de fornecedores
        var suppliersDataRange = suppliersSheet.getDataRange();
        var suppliersValues = suppliersDataRange.getValues();
        var supplierHeaders = suppliersValues[0];
        var sheetSuppliers = [];
        
        if (suppliersValues.length > 1) {
          for (var i = 1; i < suppliersValues.length; i++) {
            var row = suppliersValues[i];
            sheetSuppliers.push({
              id: row[0],
              name: row[1],
              contactName: row[2],
              email: row[3],
              phone: row[4],
              address: row[5],
              products: row[6] ? row[6].split(', ') : [],
              document: row[7],
              category: row[8]
            });
          }
        }
        
        // 2. Mesclar dados do app com dados da planilha
        var mergedSuppliers = mergeSuppliers(suppliers, sheetSuppliers);
        
        // 3. Limpar dados existentes e exportar dados mesclados
        if (suppliersSheet.getLastRow() > 1) {
          suppliersSheet.getRange(2, 1, suppliersSheet.getLastRow() - 1, suppliersSheet.getLastColumn()).clear();
        }
        
        if (mergedSuppliers.length > 0) {
          var supplierValues = mergedSuppliers.map(function(s) {
            return [
              s.id,
              s.name,
              s.contactName || '',
              s.email || '',
              s.phone,
              s.address || '',
              (s.products || []).join(', '),
              s.document || '',
              s.category || ''
            ];
          });
          
          suppliersSheet.getRange(2, 1, supplierValues.length, supplierValues[0].length).setValues(supplierValues);
          suppliersSheet.autoResizeColumns(1, supplierValues[0].length);
        }
      }
      
      result = {
        success: true,
        message: 'Operações sincronizadas com sucesso!'
      };
    }
    
    else {
      result = {
        success: false,
        error: 'Ação inválida ou dados ausentes'
      };
    }
    
    var jsonOutput;
    if (isIframe) {
      // Para solicitações de iframe, precisamos enviar uma resposta que inclua script para postMessage
      var iframeId = e.parameter._iframe;
      var responseHtml = '<html><body><script>window.parent.postMessage(' + 
                         JSON.stringify({ 
                           iframeId: iframeId, 
                           data: result 
                         }) + 
                         ', "*");</script></body></html>';
                         
      return HtmlService.createHtmlOutput(responseHtml);
    } else {
      // Para solicitações normais, enviar resposta JSON
      return output.setContent(JSON.stringify(result));
    }
    
  } catch (error) {
    Logger.log('Erro: ' + error.toString());
    
    if (isIframe) {
      // Para solicitações de iframe, enviar erro via postMessage
      var iframeId = e.parameter._iframe;
      var responseHtml = '<html><body><script>window.parent.postMessage(' + 
                         JSON.stringify({ 
                           iframeId: iframeId, 
                           error: error.toString() 
                         }) + 
                         ', "*");</script></body></html>';
                         
      return HtmlService.createHtmlOutput(responseHtml);
    } else {
      // Para solicitações normais, enviar erro como JSON
      return output.setContent(JSON.stringify({
        success: false,
        error: error.toString()
      }));
    }
  }
}

// Função para mesclar produtos
function mergeProducts(appProducts, sheetProducts) {
  var mergedMap = {};
  
  // Adicionar todos os produtos do app ao mapa
  appProducts.forEach(function(product) {
    mergedMap[product.id] = product;
  });
  
  // Adicionar/atualizar produtos da planilha
  sheetProducts.forEach(function(product) {
    // Se o produto não existe no app, adicionar
    if (!mergedMap[product.id]) {
      mergedMap[product.id] = product;
    }
    // Se o produto existe em ambos, usar a versão mais recente baseado numa heurística
    // (por exemplo, comparar campos específicos para decidir qual versão manter)
  });
  
  // Converter o mapa de volta para um array
  var mergedArray = [];
  for (var id in mergedMap) {
    if (mergedMap.hasOwnProperty(id)) {
      mergedArray.push(mergedMap[id]);
    }
  }
  
  return mergedArray;
}

// Função para mesclar fornecedores
function mergeSuppliers(appSuppliers, sheetSuppliers) {
  var mergedMap = {};
  
  // Adicionar todos os fornecedores do app ao mapa
  appSuppliers.forEach(function(supplier) {
    mergedMap[supplier.id] = supplier;
  });
  
  // Adicionar/atualizar fornecedores da planilha
  sheetSuppliers.forEach(function(supplier) {
    // Se o fornecedor não existe no app, adicionar
    if (!mergedMap[supplier.id]) {
      mergedMap[supplier.id] = supplier;
    }
    // Se o fornecedor existe em ambos, usar a versão mais recente baseado numa heurística
    // (por exemplo, comparar campos específicos para decidir qual versão manter)
  });
  
  // Converter o mapa de volta para um array
  var mergedArray = [];
  for (var id in mergedMap) {
    if (mergedMap.hasOwnProperty(id)) {
      mergedArray.push(mergedMap[id]);
    }
  }
  
  return mergedArray;
}
`;
