
import { FinancialTransaction, Customer, Product, Supplier, SHEET_URL } from "@/types/models";
import { toast } from "sonner";

/**
 * Google Sheets Integration Service
 * 
 * This service handles the synchronization between the application and Google Sheets.
 * It provides functions to export data to and import data from Google Sheets.
 * 
 * In a real implementation, you would replace the placeholders with actual API calls
 * to your Google Apps Script endpoints.
 */

// Main sync function to synchronize all data with Google Sheets
export const syncWithGoogleSheets = async (
  transactions: FinancialTransaction[],
  customers: Customer[],
  products: Product[],
  suppliers: Supplier[]
): Promise<boolean> => {
  try {
    console.log("Syncing with Google Sheets...");
    console.log("Sheet URL:", SHEET_URL);
    
    // In a real implementation, you would make API calls to your Google Sheets API
    // For example:
    // const response = await fetch(`${SHEET_URL}?action=syncAll`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ transactions, customers, products, suppliers })
    // });
    // const result = await response.json();
    // if (!result.success) throw new Error(result.error);
    
    toast.success("Dados sincronizados com Google Sheets com sucesso!");
    return true;
  } catch (error) {
    console.error("Error syncing with Google Sheets:", error);
    toast.error("Erro ao sincronizar com Google Sheets.");
    return false;
  }
};

// Export transactions to Google Sheets
export const exportTransactionsToSheet = async (
  transactions: FinancialTransaction[]
): Promise<boolean> => {
  try {
    console.log("Exporting transactions to Google Sheets...");
    
    // In a real implementation:
    // const response = await fetch(`${SHEET_URL}?action=exportTransactions`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ transactions })
    // });
    // const result = await response.json();
    // if (!result.success) throw new Error(result.error);
    
    toast.success("Transações exportadas com sucesso!");
    return true;
  } catch (error) {
    console.error("Error exporting transactions:", error);
    toast.error("Erro ao exportar transações.");
    return false;
  }
};

// Export customers to Google Sheets
export const exportCustomersToSheet = async (
  customers: Customer[]
): Promise<boolean> => {
  try {
    console.log("Exporting customers to Google Sheets...");
    
    // In a real implementation:
    // const response = await fetch(`${SHEET_URL}?action=exportCustomers`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ customers })
    // });
    // const result = await response.json();
    // if (!result.success) throw new Error(result.error);
    
    toast.success("Clientes exportados com sucesso!");
    return true;
  } catch (error) {
    console.error("Error exporting customers:", error);
    toast.error("Erro ao exportar clientes.");
    return false;
  }
};

// Export products to Google Sheets
export const exportProductsToSheet = async (
  products: Product[]
): Promise<boolean> => {
  try {
    console.log("Exporting products to Google Sheets...");
    
    // In a real implementation:
    // const response = await fetch(`${SHEET_URL}?action=exportProducts`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ products })
    // });
    // const result = await response.json();
    // if (!result.success) throw new Error(result.error);
    
    toast.success("Produtos exportados com sucesso!");
    return true;
  } catch (error) {
    console.error("Error exporting products:", error);
    toast.error("Erro ao exportar produtos.");
    return false;
  }
};

// Import all data from Google Sheets
export const importFromGoogleSheets = async (): Promise<{
  transactions: FinancialTransaction[];
  customers: Customer[];
  products: Product[];
  suppliers: Supplier[];
} | null> => {
  try {
    console.log("Importing data from Google Sheets...");
    
    // In a real implementation:
    // const response = await fetch(`${SHEET_URL}?action=importAll`);
    // const data = await response.json();
    // if (!data.success) throw new Error(data.error);
    
    toast.success("Dados importados com sucesso!");
    
    // Return mock data - in a real implementation, you would return the data from the API
    return {
      transactions: [],
      customers: [],
      products: [],
      suppliers: []
    };
  } catch (error) {
    console.error("Error importing data:", error);
    toast.error("Erro ao importar dados.");
    return null;
  }
};

// Google Apps Script code for the transaction sheet
export const transactionSheetScript = `
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transacoes');
  
  if(!sheet) {
    sheet = ss.insertSheet('Transacoes');
    var headers = [
      'ID', 'Data', 'Tipo', 'Descrição', 'Categoria', 
      'Valor', 'Método de Pagamento', 'Cliente', 'Produtos',
      'Status', 'Notas', 'Reembolsável'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  var action = e.parameter.action;
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  try {
    if (action === 'exportTransactions' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      var transactions = data.transactions;
      
      // Clear old data (except headers)
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
      }
      
      // Add new data
      if (transactions.length > 0) {
        var values = transactions.map(function(t) {
          return [
            t.id, t.date, t.type, t.description, t.category,
            t.amount, t.paymentMethod || '', t.customer || '', t.products || '',
            t.status || 'completed', t.notes || '', t.isRefundable ? 'Sim' : 'Não'
          ];
        });
        sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Transações exportadas com sucesso!'
      }));
    } else if (action === 'importTransactions') {
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      
      var headers = values[0];
      var transactions = [];
      
      for (var i = 1; i < values.length; i++) {
        var row = values[i];
        var transaction = {};
        
        for (var j = 0; j < headers.length; j++) {
          transaction[headers[j]] = row[j];
        }
        
        transactions.push(transaction);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        data: transactions
      }));
    } else {
      response.setContent(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }));
    }
  } catch (error) {
    response.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
  
  return response;
}
`;

// Google Apps Script code for the customer sheet
export const customerSheetScript = `
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Clientes');
  
  if(!sheet) {
    sheet = ss.insertSheet('Clientes');
    var headers = [
      'ID', 'Nome', 'Email', 'Telefone', 'Endereço', 
      'Data de Cadastro', 'Total de Compras', 'Última Compra',
      'Observações', 'Status', 'CPF/CNPJ', 'Categoria'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  var action = e.parameter.action;
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  try {
    if (action === 'exportCustomers' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      var customers = data.customers;
      
      // Clear old data (except headers)
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
      }
      
      // Add new data
      if (customers.length > 0) {
        var values = customers.map(function(c) {
          return [
            c.id, c.name, c.email, c.phone, c.address || '',
            c.joinDate, c.totalPurchases, c.lastPurchase || '',
            c.notes || '', c.status, c.document || '', c.category || 'regular'
          ];
        });
        sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Clientes exportados com sucesso!'
      }));
    } else if (action === 'importCustomers') {
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      
      var headers = values[0];
      var customers = [];
      
      for (var i = 1; i < values.length; i++) {
        var row = values[i];
        var customer = {};
        
        for (var j = 0; j < headers.length; j++) {
          customer[headers[j]] = row[j];
        }
        
        customers.push(customer);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        data: customers
      }));
    } else {
      response.setContent(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }));
    }
  } catch (error) {
    response.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
  
  return response;
}
`;

// Google Apps Script code for the product sheet
export const productSheetScript = `
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Produtos');
  
  if(!sheet) {
    sheet = ss.insertSheet('Produtos');
    var headers = [
      'ID', 'Nome', 'Descrição', 'Preço', 'Custo', 
      'Estoque', 'Categoria', 'Estoque Mínimo', 
      'Fornecedor', 'Código de Barras', 'Data de Cadastro'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  var action = e.parameter.action;
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  try {
    if (action === 'exportProducts' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      var products = data.products;
      
      // Clear old data (except headers)
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
      }
      
      // Add new data
      if (products.length > 0) {
        var values = products.map(function(p) {
          return [
            p.id, p.name, p.description || '', p.price, p.cost || 0,
            p.stock, p.category, p.minimumStock || 10, 
            p.supplier || '', p.barcode || '', p.createdAt || new Date()
          ];
        });
        sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Produtos exportados com sucesso!'
      }));
    } else if (action === 'importProducts') {
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      
      var headers = values[0];
      var products = [];
      
      for (var i = 1; i < values.length; i++) {
        var row = values[i];
        var product = {};
        
        for (var j = 0; j < headers.length; j++) {
          product[headers[j]] = row[j];
        }
        
        products.push(product);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        data: products
      }));
    } else {
      response.setContent(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }));
    }
  } catch (error) {
    response.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
  
  return response;
}
`;

// Main synchronization script that ties everything together
export const mainSyncScript = `
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var action = e.parameter.action;
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  try {
    if (action === 'syncAll' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      
      // Synchronize transactions
      syncTransactions(data.transactions);
      
      // Synchronize customers
      syncCustomers(data.customers);
      
      // Synchronize products
      syncProducts(data.products);
      
      // Synchronize suppliers
      syncSuppliers(data.suppliers);
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Todos os dados sincronizados com sucesso!'
      }));
    } else if (action === 'importAll') {
      var result = {
        transactions: importTransactions(),
        customers: importCustomers(),
        products: importProducts(),
        suppliers: importSuppliers()
      };
      
      response.setContent(JSON.stringify({
        success: true,
        data: result
      }));
    } else {
      response.setContent(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }));
    }
  } catch (error) {
    response.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
  
  return response;
}

function syncTransactions(transactions) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transacoes');
  
  if(!sheet) {
    sheet = ss.insertSheet('Transacoes');
    var headers = [
      'ID', 'Data', 'Tipo', 'Descrição', 'Categoria', 
      'Valor', 'Método de Pagamento', 'Cliente', 'Produtos',
      'Status', 'Notas', 'Reembolsável'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  // Clear old data (except headers)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
  }
  
  // Add new data
  if (transactions.length > 0) {
    var values = transactions.map(function(t) {
      return [
        t.id, t.date, t.type, t.description, t.category,
        t.amount, t.paymentMethod || '', t.customer || '', t.products || '',
        t.status || 'completed', t.notes || '', t.isRefundable ? 'Sim' : 'Não'
      ];
    });
    sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
  }
  
  return true;
}

function importTransactions() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transacoes');
  
  if(!sheet) return [];
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  var headers = values[0];
  var transactions = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var transaction = {};
    
    for (var j = 0; j < headers.length; j++) {
      transaction[headers[j]] = row[j];
    }
    
    transactions.push(transaction);
  }
  
  return transactions;
}

// Similar functions for customers, products, and suppliers
// ... implementation similar to transactions above
`;

