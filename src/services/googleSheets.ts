import { FinancialTransaction, Customer, Product, Supplier, SHEET_URL } from "@/types/models";
import { toast } from "sonner";

/**
 * Google Sheets Integration Service
 * 
 * Este serviço gerencia a sincronização entre o aplicativo e o Google Sheets.
 * Fornece funções para exportar dados para e importar dados do Google Sheets.
 */

// URL base para cada planilha (configurada pelo usuário)
export const FINANCEIRO_SHEET_URL = "LINK-DA-SUA-PLANILHA-PÚBLICA";
export const CLIENTES_SHEET_URL = "LINK-DA-SUA-PLANILHA-PÚBLICA";
export const OPERACOES_SHEET_URL = "LINK-DA-SUA-PLANILHA-PÚBLICA";

// Sistema de log para rastrear operações com Google Sheets
export const syncLog = {
  logs: [] as {timestamp: string, action: string, status: string, details?: string}[],
  
  add(action: string, status: string, details?: string) {
    const timestamp = new Date().toISOString();
    const log = { timestamp, action, status, details };
    this.logs.unshift(log); // Adiciona no início para logs mais recentes primeiro
    
    // Manter apenas os últimos 100 logs
    if (this.logs.length > 100) {
      this.logs.pop();
    }
    
    console.log(`[Sheets Sync] ${timestamp} - ${action}: ${status}`, details || '');
    return log;
  },
  
  getLogs() {
    return this.logs;
  },
  
  clearLogs() {
    this.logs = [];
  }
};

// Métodos disponíveis para contornar CORS
export type CorsMethod = 'direct' | 'proxy' | 'jsonp' | 'no-cors' | 'no-cache' | 'xhr' | 'iframe';

// Configuração global do método CORS
let currentCorsMethod: CorsMethod = 'direct';

export const setCorsMethod = (method: CorsMethod) => {
  syncLog.add('CORS Config', `Definindo método para: ${method}`, '');
  currentCorsMethod = method;
};

export const getCurrentCorsMethod = (): CorsMethod => currentCorsMethod;

// JSONP implementação (script tag dinâmico)
const fetchWithJsonp = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');
    
    // Limpar função de callback e remover script após execução
    const cleanup = () => {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
    };
    
    // Definir callback global
    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };
    
    // Configurar script para falhar após timeout
    script.onerror = (err) => {
      cleanup();
      reject(new Error('JSONP request failed'));
    };
    
    // Adicionar script ao DOM
    const urlWithCallback = url.includes('?') 
      ? `${url}&callback=${callbackName}` 
      : `${url}?callback=${callbackName}`;
    
    script.src = urlWithCallback;
    document.body.appendChild(script);
    
    // Timeout de segurança
    setTimeout(() => {
      if ((window as any)[callbackName]) {
        cleanup();
        reject(new Error('JSONP request timed out'));
      }
    }, 30000);
  });
};

// Implementação iframe
const fetchWithIframe = (url: string, data?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    const uniqueId = `iframe_${Date.now()}`;
    
    iframe.style.display = 'none';
    iframe.name = uniqueId;
    iframe.id = uniqueId;
    
    // Evento para receber dados de volta
    window.addEventListener('message', function onMessage(event) {
      try {
        const response = JSON.parse(event.data);
        if (response.iframeId === uniqueId) {
          window.removeEventListener('message', onMessage);
          document.body.removeChild(iframe);
          resolve(response.data);
        }
      } catch (e) {
        // Ignorar mensagens que não são JSON
      }
    });
    
    // Configurar iframe para falhar após timeout
    setTimeout(() => {
      if (document.getElementById(uniqueId)) {
        document.body.removeChild(iframe);
        reject(new Error('Iframe request timed out'));
      }
    }, 30000);
    
    // Criar formulário dentro do iframe
    document.body.appendChild(iframe);
    const form = document.createElement('form');
    form.action = url;
    form.method = data ? 'POST' : 'GET';
    form.target = uniqueId;
    
    if (data) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'data';
      input.value = JSON.stringify(data);
      form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  });
};

// XMLHttpRequest implementação
const fetchWithXhr = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url, true);
    
    // Adicionar headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value as string);
      });
    }
    
    xhr.onload = () => {
      const response = new Response(xhr.responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: new Headers({
          'Content-Type': xhr.getResponseHeader('Content-Type') || 'application/json'
        })
      });
      resolve(response);
    };
    
    xhr.onerror = () => reject(new Error('XHR request failed'));
    xhr.ontimeout = () => reject(new Error('XHR request timed out'));
    
    // Enviar dados
    const body = options.body ? 
      (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : 
      null;
    
    xhr.send(body);
  });
};

// Função avançada para teste de CORS
export const testCorsMethod = async (
  url: string, 
  method: CorsMethod, 
  body?: any
): Promise<{ success: boolean, data?: any, error?: string, method: CorsMethod }> => {
  syncLog.add('CORS Test', `Testando método: ${method}`, `URL: ${url}`);
  
  try {
    let response;
    
    switch (method) {
      case 'direct':
        response = await fetch(url, {
          method: body ? 'POST' : 'GET',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        return { success: true, data, method };
        
      case 'proxy':
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        response = await fetch(proxyUrl, {
          method: body ? 'POST' : 'GET',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const proxyData = await response.json();
        return { success: true, data: proxyData, method };
        
      case 'jsonp':
        if (body) {
          throw new Error('JSONP não suporta requisições POST com corpo');
        }
        const jsonpResult = await fetchWithJsonp(url);
        return { success: true, data: jsonpResult, method };
        
      case 'no-cors':
        await fetch(url, {
          method: body ? 'POST' : 'GET',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined
        });
        // No-cors sempre retorna "opaque response" que não pode ser lida
        // Assumimos sucesso se não houver erro
        return { success: true, data: { message: "Requisição enviada no modo no-cors (resposta não disponível)" }, method };
        
      case 'no-cache':
        response = await fetch(url, {
          method: body ? 'POST' : 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: { 
            'Content-Type': 'application/json',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          },
          body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const noCacheData = await response.json();
        return { success: true, data: noCacheData, method };
        
      case 'xhr':
        response = await fetchWithXhr(url, {
          method: body ? 'POST' : 'GET',
          headers: { 'Content-Type': 'application/json' },
          body
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const xhrData = await response.json();
        return { success: true, data: xhrData, method };
        
      case 'iframe':
        const iframeResult = await fetchWithIframe(url, body);
        return { success: true, data: iframeResult, method };
        
      default:
        throw new Error(`Método CORS desconhecido: ${method}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    syncLog.add('CORS Test', `Erro com método ${method}`, errorMessage);
    return { success: false, error: errorMessage, method };
  }
};

// Função auxiliar avançada para lidar com CORS
const fetchWithCORS = async (url: string, options: RequestInit = {}): Promise<Response> => {
  syncLog.add('Fetch', `Tentando com método: ${currentCorsMethod}`, `URL: ${url}`);
  
  try {
    switch (currentCorsMethod) {
      case 'direct':
        const directResponse = await fetch(url, {
          ...options,
          mode: 'cors',
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
          }
        });
        syncLog.add('Fetch', 'Sucesso com direct', `URL: ${url}`);
        return directResponse;
        
      case 'proxy':
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        const proxyResponse = await fetch(proxyUrl, {
          ...options,
          mode: 'cors',
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
          }
        });
        syncLog.add('Fetch', 'Sucesso com proxy', `URL: ${proxyUrl}`);
        return proxyResponse;
        
      case 'no-cors':
        // No-cors não permite ler a resposta, usado principalmente para POST
        const noCorsResponse = await fetch(url, {
          ...options,
          mode: 'no-cors',
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
          }
        });
        syncLog.add('Fetch', 'Enviado com no-cors', `URL: ${url}`);
        // Simulamos uma resposta bem-sucedida já que não podemos ler a real
        return new Response(JSON.stringify({ success: true, simulated: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'no-cache':
        const noCacheResponse = await fetch(url, {
          ...options,
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        syncLog.add('Fetch', 'Sucesso com no-cache', `URL: ${url}`);
        return noCacheResponse;
        
      case 'xhr':
        const xhrResponse = await fetchWithXhr(url, options);
        syncLog.add('Fetch', 'Sucesso com XHR', `URL: ${url}`);
        return xhrResponse;
        
      case 'jsonp':
        if (options.method === 'POST') {
          throw new Error('JSONP não suporta requisições POST com corpo');
        }
        const jsonpResult = await fetchWithJsonp(url);
        syncLog.add('Fetch', 'Sucesso com JSONP', `URL: ${url}`);
        // Converter resultado JSONP para Response
        return new Response(JSON.stringify(jsonpResult), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'iframe':
        const body = options.body ? 
          (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : 
          undefined;
        
        const iframeResult = await fetchWithIframe(url, body);
        syncLog.add('Fetch', 'Sucesso com iframe', `URL: ${url}`);
        // Converter resultado iframe para Response
        return new Response(JSON.stringify(iframeResult), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      default:
        throw new Error(`Método CORS desconhecido: ${currentCorsMethod}`);
    }
  } catch (error) {
    syncLog.add('Fetch', `Erro com método ${currentCorsMethod}`, `${error}`);
    throw error;
  }
};

// Função principal de sincronização para sincronizar todos os dados com o Google Sheets
export const syncWithGoogleSheets = async (
  transactions: FinancialTransaction[],
  customers: Customer[],
  products: Product[],
  suppliers: Supplier[]
): Promise<boolean> => {
  try {
    syncLog.add('Sincronização', 'Iniciando', 'Sincronizando todos os dados');
    console.log("Sincronizando com Google Sheets...");
    
    // Sincronizar transações financeiras
    await syncFinanceiro(transactions);
    
    // Sincronizar clientes
    await syncClientes(customers);
    
    // Sincronizar produtos e fornecedores
    await syncOperacoes(products, suppliers);
    
    syncLog.add('Sincronização', 'Concluída', 'Todos os dados sincronizados com sucesso');
    toast.success("Dados sincronizados com Google Sheets com sucesso!");
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    syncLog.add('Sincronização', 'Erro', `Erro: ${errorMsg}`);
    console.error("Erro ao sincronizar com Google Sheets:", error);
    toast.error("Erro ao sincronizar com Google Sheets.");
    return false;
  }
};

// Sincronizar dados com a planilha Financeiro
const syncFinanceiro = async (transactions: FinancialTransaction[]): Promise<void> => {
  try {
    syncLog.add('Sincronizar Financeiro', 'Iniciando', `Enviando ${transactions.length} transações`);
    
    const response = await fetchWithCORS(`${FINANCEIRO_SHEET_URL}?action=syncTransactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao sincronizar transações: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Erro desconhecido ao sincronizar transações");
    }
    
    syncLog.add('Sincronizar Financeiro', 'Sucesso', 'Transações sincronizadas');
  } catch (error) {
    syncLog.add('Sincronizar Financeiro', 'Erro', `${error}`);
    console.error("Erro ao sincronizar transações:", error);
    throw error;
  }
};

// Sincronizar dados com a planilha Clientes
const syncClientes = async (customers: Customer[]): Promise<void> => {
  try {
    syncLog.add('Sincronizar Clientes', 'Iniciando', `Enviando ${customers.length} clientes`);
    
    const response = await fetchWithCORS(`${CLIENTES_SHEET_URL}?action=syncCustomers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers })
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao sincronizar clientes: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Erro desconhecido ao sincronizar clientes");
    }
    
    syncLog.add('Sincronizar Clientes', 'Sucesso', 'Clientes sincronizados');
  } catch (error) {
    syncLog.add('Sincronizar Clientes', 'Erro', `${error}`);
    console.error("Erro ao sincronizar clientes:", error);
    throw error;
  }
};

// Sincronizar dados com a planilha Operações
const syncOperacoes = async (products: Product[], suppliers: Supplier[]): Promise<void> => {
  try {
    syncLog.add('Sincronizar Operações', 'Iniciando', `Enviando ${products.length} produtos e ${suppliers.length} fornecedores`);
    
    const response = await fetchWithCORS(`${OPERACOES_SHEET_URL}?action=syncOperations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, suppliers })
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao sincronizar operações: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Erro desconhecido ao sincronizar operações");
    }
    
    syncLog.add('Sincronizar Operações', 'Sucesso', 'Produtos e fornecedores sincronizados');
  } catch (error) {
    syncLog.add('Sincronizar Operações', 'Erro', `${error}`);
    console.error("Erro ao sincronizar operações:", error);
    throw error;
  }
};

// Exportar transações para o Google Sheets
export const exportTransactionsToSheet = async (
  transactions: FinancialTransaction[]
): Promise<boolean> => {
  try {
    syncLog.add('Exportar Transações', 'Iniciando', `Exportando ${transactions.length} transações`);
    
    const response = await fetchWithCORS(`${FINANCEIRO_SHEET_URL}?action=exportTransactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na exportação: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Erro desconhecido");
    }
    
    syncLog.add('Exportar Transações', 'Sucesso', 'Transações exportadas com sucesso');
    toast.success("Transações exportadas com sucesso!");
    return true;
  } catch (error) {
    syncLog.add('Exportar Transações', 'Erro', `${error}`);
    console.error("Erro ao exportar transações:", error);
    toast.error("Erro ao exportar transações.");
    return false;
  }
};

// Exportar clientes para o Google Sheets
export const exportCustomersToSheet = async (
  customers: Customer[]
): Promise<boolean> => {
  try {
    syncLog.add('Exportar Clientes', 'Iniciando', `Exportando ${customers.length} clientes`);
    
    const response = await fetchWithCORS(`${CLIENTES_SHEET_URL}?action=exportCustomers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na exportação: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Erro desconhecido");
    }
    
    syncLog.add('Exportar Clientes', 'Sucesso', 'Clientes exportados com sucesso');
    toast.success("Clientes exportados com sucesso!");
    return true;
  } catch (error) {
    syncLog.add('Exportar Clientes', 'Erro', `${error}`);
    console.error("Erro ao exportar clientes:", error);
    toast.error("Erro ao exportar clientes.");
    return false;
  }
};

// Exportar produtos para o Google Sheets
export const exportProductsToSheet = async (
  products: Product[]
): Promise<boolean> => {
  try {
    syncLog.add('Exportar Produtos', 'Iniciando', `Exportando ${products.length} produtos`);
    
    const response = await fetchWithCORS(`${OPERACOES_SHEET_URL}?action=exportProducts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na exportação: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Erro desconhecido");
    }
    
    syncLog.add('Exportar Produtos', 'Sucesso', 'Produtos exportados com sucesso');
    toast.success("Produtos exportados com sucesso!");
    return true;
  } catch (error) {
    syncLog.add('Exportar Produtos', 'Erro', `${error}`);
    console.error("Erro ao exportar produtos:", error);
    toast.error("Erro ao exportar produtos.");
    return false;
  }
};

// Importar dados do Google Sheets
export const importFromGoogleSheets = async (): Promise<{
  transactions: FinancialTransaction[];
  customers: Customer[];
  products: Product[];
  suppliers: Supplier[];
} | null> => {
  try {
    syncLog.add('Importar Dados', 'Iniciando', 'Importando dados de todas as planilhas');

    // Importar transações
    const transactionsResponse = await fetchWithCORS(`${FINANCEIRO_SHEET_URL}?action=importTransactions`);
    if (!transactionsResponse.ok) {
      throw new Error(`Erro ao importar transações: ${transactionsResponse.statusText}`);
    }
    const transactionsData = await transactionsResponse.json();
    syncLog.add('Importar Transações', 'Sucesso', `${transactionsData.data?.length || 0} transações importadas`);
    
    // Importar clientes
    const customersResponse = await fetchWithCORS(`${CLIENTES_SHEET_URL}?action=importCustomers`);
    if (!customersResponse.ok) {
      throw new Error(`Erro ao importar clientes: ${customersResponse.statusText}`);
    }
    const customersData = await customersResponse.json();
    syncLog.add('Importar Clientes', 'Sucesso', `${customersData.data?.length || 0} clientes importados`);
    
    // Importar produtos e fornecedores
    const operationsResponse = await fetchWithCORS(`${OPERACOES_SHEET_URL}?action=importOperations`);
    if (!operationsResponse.ok) {
      throw new Error(`Erro ao importar operações: ${operationsResponse.statusText}`);
    }
    const operationsData = await operationsResponse.json();
    syncLog.add('Importar Operações', 'Sucesso', 
      `${operationsData.data?.products?.length || 0} produtos e 
       ${operationsData.data?.suppliers?.length || 0} fornecedores importados`);
    
    syncLog.add('Importar Dados', 'Concluído', 'Todos os dados foram importados com sucesso');
    toast.success("Dados importados com sucesso!");
    
    return {
      transactions: transactionsData.data || [],
      customers: customersData.data || [],
      products: operationsData.data?.products || [],
      suppliers: operationsData.data?.suppliers || []
    };
  } catch (error) {
    syncLog.add('Importar Dados', 'Erro', `${error}`);
    console.error("Erro ao importar dados:", error);
    toast.error("Erro ao importar dados.");
    return null;
  }
};

// Código Google Apps Script para a planilha de Financeiro
export const financeiroSheetScript = `
/**
 * Script para Planilha de Finanças
 * URL da planilha: https://docs.google.com/spreadsheets/d/1p1VUN_9CMuiQs3xC1sHlelHeq1gtzoMVqh1n0WxQQOg/edit?gid=0
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transacoes') || ss.insertSheet('Transacoes');
  
  // Verificar se a planilha já tem cabeçalhos, caso não, criar
  if (sheet.getLastRow() === 0) {
    var headers = [
      'ID', 'Data', 'Tipo', 'Descrição', 'Categoria', 
      'Valor', 'Método de Pagamento', 'Cliente', 'ClienteID',
      'Produtos', 'ProdutoIDs', 'Status', 'Notas', 
      'Reembolsável', 'Transação Relacionada'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formatar cabeçalhos
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
  }
  
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var action = e.parameter.action;
    
    // Exportar transações para a planilha
    if (action === 'exportTransactions' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      var transactions = data.transactions;
      
      // Limpar dados existentes (exceto cabeçalhos)
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
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
        
        sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
        
        // Formatar colunas
        sheet.autoResizeColumns(1, values[0].length);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Transações exportadas com sucesso!'
      }));
      
      return response;
    }
    
    // Importar transações da planilha
    else if (action === 'importTransactions') {
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      
      if (values.length <= 1) {
        response.setContent(JSON.stringify({
          success: true,
          data: []
        }));
        return response;
      }
      
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
      
      response.setContent(JSON.stringify({
        success: true,
        data: transactions
      }));
      
      return response;
    }
    
    // Sincronizar todas as transações
    else if (action === 'syncTransactions' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      var transactions = data.transactions;
      
      // Implementar sincronização bidirecional
      // 1. Obter dados existentes da planilha
      var dataRange = sheet.getDataRange();
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
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
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
        
        sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
        sheet.autoResizeColumns(1, values[0].length);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Transações sincronizadas com sucesso!'
      }));
      
      return response;
    }
    
    else {
      response.setContent(JSON.stringify({
        success: false,
        error: 'Ação inválida ou dados ausentes'
      }));
      
      return response;
    }
  } catch (error) {
    response.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
    
    return response;
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

// Código Google Apps Script para a planilha de Clientes
export const clientesSheetScript = `
/**
 * Script para Planilha de Clientes
 * URL da planilha: https://docs.google.com/spreadsheets/d/1ywVsdLbnqGa0UX9JI_o1OECZwY2eVZWiS1pYX3tHqSc/edit?gid=0
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Clientes') || ss.insertSheet('Clientes');
  
  // Verificar se a planilha já tem cabeçalhos, caso não, criar
  if (sheet.getLastRow() === 0) {
    var headers = [
      'ID', 'Nome', 'Email', 'Telefone', 'Endereço', 
      'Data de Cadastro', 'Total de Compras', 'Última Compra',
      'Observações', 'Status', 'CPF/CNPJ', 'Categoria'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formatar cabeçalhos
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
  }
  
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var action = e.parameter.action;
    
    // Exportar clientes para a planilha
    if (action === 'exportCustomers' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      var customers = data.customers;
      
      // Limpar dados existentes (exceto cabeçalhos)
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
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
        
        sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
        
        // Formatar colunas
        sheet.autoResizeColumns(1, values[0].length);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Clientes exportados com sucesso!'
      }));
      
      return response;
    }
    
    // Importar clientes da planilha
    else if (action === 'importCustomers') {
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      
      if (values.length <= 1) {
        response.setContent(JSON.stringify({
          success: true,
          data: []
        }));
        return response;
      }
      
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
      
      response.setContent(JSON.stringify({
        success: true,
        data: customers
      }));
      
      return response;
    }
    
    // Sincronizar todos os clientes
    else if (action === 'syncCustomers' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      var customers = data.customers;
      
      // Implementar sincronização bidirecional
      // 1. Obter dados existentes da planilha
      var dataRange = sheet.getDataRange();
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
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
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
        
        sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
        sheet.autoResizeColumns(1, values[0].length);
      }
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Clientes sincronizados com sucesso!'
      }));
      
      return response;
    }
    
    else {
      response.setContent(JSON.stringify({
        success: false,
        error: 'Ação inválida ou dados ausentes'
      }));
      
      return response;
    }
  } catch (error) {
    response.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
    
    return response;
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

// Código Google Apps Script para a planilha de Operações
export const operacoesSheetScript = `
/**
 * Script para Planilha de Operações
 * URL da planilha: https://docs.google.com/spreadsheets/d/1VG24l45pKfvFdPVatvWT8wym0K-4IW8ZyABu4EBc0Yc/edit?gid=0
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var productsSheet = ss.getSheetByName('Produtos') || ss.insertSheet('Produtos');
  var suppliersSheet = ss.getSheetByName('Fornecedores') || ss.insertSheet('Fornecedores');
  
  // Configurar cabeçalhos para Produtos
  if (productsSheet.getLastRow() === 0) {
    var productHeaders = [
      'ID', 'Nome', 'Descrição', 'Preço', 'Custo',
      'Estoque', 'Categoria', 'Estoque Mínimo',
      'Fornecedor', 'Código de Barras', 'Data de Cadastro'
    ];
    productsSheet.getRange(1, 1, 1, productHeaders.length).setValues([productHeaders]);
    
    // Formatar cabeçalhos
    productsSheet.getRange(1, 1, 1, productHeaders.length)
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
  }
  
  // Configurar cabeçalhos para Fornecedores
  if (suppliersSheet.getLastRow() === 0) {
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
  
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var action = e.parameter.action;
    
    // Exportar produtos para a planilha
    if (action === 'exportProducts' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      var products = data.products;
      
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
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Produtos exportados com sucesso!'
      }));
      
      return response;
    }
    
    // Sincronizar operações (produtos e fornecedores)
    else if (action === 'syncOperations' && e.postData) {
      var data = JSON.parse(e.postData.contents);
      var products = data.products;
      var suppliers = data.suppliers;
      
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
      
      response.setContent(JSON.stringify({
        success: true,
        message: 'Operações sincronizadas com sucesso!'
      }));
      
      return response;
    }
    
    // Importar operações da planilha
    else if (action === 'importOperations') {
      // Importar produtos
      var productsDataRange = productsSheet.getDataRange();
      var productsValues = productsDataRange.getValues();
      var products = [];
      
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
      
      response.setContent(JSON.stringify({
        success: true,
        data: {
          products: products,
          suppliers: suppliers
        }
      }));
      
      return response;
    }
    
    else {
      response.setContent(JSON.stringify({
        success: false,
        error: 'Ação inválida ou dados ausentes'
      }));
      
      return response;
    }
  } catch (error) {
    response.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
    
    return response;
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

// Instruções para integração com Google Sheets
export const sheetIntegrationInstructions = `
Para integrar o sistema com o Google Sheets, siga estes passos para cada planilha:

1. Acesse as planilhas do Google nas URLs fornecidas
2. Clique em Extensões > Apps Script
3. Cole o código correspondente para cada planilha
4. Salve o projeto (Ctrl+S ou Cmd+S)
5. Clique em Implantar > Nova implantação
6. Selecione "Aplicativo da web"
7. Configure:
   - Execute como: Eu mesmo (seu email)
   - Quem tem acesso: Qualquer pessoa
8. Clique em "Implantar"
9. Copie a URL do aplicativo da web gerado
10. No aplicativo, substitua as URLs dos scripts no arquivo googleSheets.ts pelos URLs obtidos

Importante: Certifique-se de que as planilhas estejam configuradas com as permissões corretas e que as colunas correspondam às esperadas pelos scripts.
`;
