
import { 
  FinancialTransaction, 
  Customer, 
  Product, 
  Supplier,
  FINANCEIRO_SCRIPT_URL,
  CLIENTES_SCRIPT_URL,
  OPERACOES_SCRIPT_URL
} from "@/types/models";

// Define the CorsMethod type
export type CorsMethod = 'direct' | 'proxy' | 'no-cors' | 'no-cache' | 'xhr' | 'jsonp' | 'iframe';

// URLs base para cada planilha (configurável pelo usuário)
export let FINANCEIRO_SHEET_URL = "https://docs.google.com/spreadsheets/d/1nOj6f8jrx5P10KcNDhkJxnd0303J3ktT5SE3-ie4wjM/edit?gid=1993830262#gid=1993830262";
export let CLIENTES_SHEET_URL = "https://docs.google.com/spreadsheets/d/1ivmrRgpduYwyV9kXc3jpj9TdjMGAgwGo8akhiWimOzc/edit?gid=0#gid=0";
export let OPERACOES_SHEET_URL = "https://docs.google.com/spreadsheets/d/1zMwckW0sLR03lJ89rKQvHRQnjj-JEjVcinztAit6Zi4/edit?gid=0#gid=0";

// URLs dos scripts para cada planilha (configurável pelo usuário)
export let scriptUrls = {
  financeiro: FINANCEIRO_SCRIPT_URL,
  clientes: CLIENTES_SCRIPT_URL,
  operacoes: OPERACOES_SCRIPT_URL
};

// Current CORS method to use for requests
let currentCorsMethod: CorsMethod = 'direct';

// Get current CORS method
export function getCurrentCorsMethod(): CorsMethod {
  return currentCorsMethod;
}

// Set CORS method
export function setCorsMethod(method: CorsMethod) {
  currentCorsMethod = method;
  localStorage.setItem('cors_method', method);
  syncLog.addLog("Configuração", "success", `Método CORS alterado para ${method}`);
}

// Test a CORS method
export async function testCorsMethod(url: string, method: CorsMethod): Promise<{success: boolean, error?: string}> {
  try {
    let response;
    
    switch(method) {
      case 'direct':
        response = await fetch(url, { 
          method: 'GET',
          mode: 'cors'
        });
        break;
      case 'proxy':
        // Using a CORS proxy service
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        response = await fetch(proxyUrl, { method: 'GET' });
        break;
      case 'no-cors':
        response = await fetch(url, { 
          method: 'GET',
          mode: 'no-cors'
        });
        break;
      case 'no-cache':
        response = await fetch(url, { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        break;
      case 'xhr':
        // Simple XHR implementation
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({ success: true });
            } else {
              resolve({ success: false, error: `Status: ${xhr.status}` });
            }
          };
          xhr.onerror = () => {
            resolve({ success: false, error: 'XHR request failed' });
          };
          xhr.send();
        });
      case 'jsonp':
      case 'iframe':
        // These methods require more complex implementation
        // and are not suitable for all API endpoints
        throw new Error(`Método ${method} não implementado para teste automático`);
    }
    
    // For no-cors mode, we can't access the response status
    if (method === 'no-cors') {
      return { success: true };
    }
    
    return { 
      success: response.ok, 
      error: !response.ok ? `Status: ${response.status}` : undefined
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Initialize CORS method from localStorage
(() => {
  const savedMethod = localStorage.getItem('cors_method');
  if (savedMethod && ['direct', 'proxy', 'no-cors', 'no-cache', 'xhr', 'jsonp', 'iframe'].includes(savedMethod)) {
    currentCorsMethod = savedMethod as CorsMethod;
  }
})();

// Sistema de log para rastrear operações com Google Sheets
export const syncLog = {
  logs: [] as Array<{timestamp: string, action: string, status: string, details?: string}>,
  addLog: function(action: string, status: string, details?: string) {
    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, action, status, details });
    console.log(`[${timestamp}] ${action}: ${status} - ${details || 'No details'}`);
  },
  getLogs: function() {
    return this.logs;
  },
  clearLogs: function() {
    this.logs = [];
  }
};

// Função para atualizar URLs dos scripts e planilhas
export function updateScriptUrls(
  financeiroScript: string,
  clientesScript: string,
  operacoesScript: string,
  financeiroSheet?: string,
  clientesSheet?: string,
  operacoesSheet?: string
) {
  // Atualizar URLs dos scripts
  scriptUrls.financeiro = financeiroScript;
  scriptUrls.clientes = clientesScript;
  scriptUrls.operacoes = operacoesScript;
  
  // Salvar no localStorage para persistência
  localStorage.setItem('financeiro_script_url', financeiroScript);
  localStorage.setItem('clientes_script_url', clientesScript);
  localStorage.setItem('operacoes_script_url', operacoesScript);
  
  // Atualizar URLs das planilhas se fornecidas
  if (financeiroSheet) {
    FINANCEIRO_SHEET_URL = financeiroSheet;
    localStorage.setItem('financeiro_sheet_url', financeiroSheet);
  }
  
  if (clientesSheet) {
    CLIENTES_SHEET_URL = clientesSheet;
    localStorage.setItem('clientes_sheet_url', clientesSheet);
  }
  
  if (operacoesSheet) {
    OPERACOES_SHEET_URL = operacoesSheet;
    localStorage.setItem('operacoes_sheet_url', operacoesSheet);
  }
  
  syncLog.addLog("Configuração", "success", "URLs de scripts e planilhas atualizadas");
  
  console.log("URLs atualizadas:", {
    scripts: scriptUrls,
    sheets: {
      financeiro: FINANCEIRO_SHEET_URL,
      clientes: CLIENTES_SHEET_URL,
      operacoes: OPERACOES_SHEET_URL
    }
  });
}

// Carregar URLs salvas no localStorage ao inicializar
(function loadSavedUrls() {
  const financeiroScript = localStorage.getItem('financeiro_script_url');
  const clientesScript = localStorage.getItem('clientes_script_url');
  const operacoesScript = localStorage.getItem('operacoes_script_url');
  
  const financeiroSheet = localStorage.getItem('financeiro_sheet_url');
  const clientesSheet = localStorage.getItem('clientes_sheet_url');
  const operacoesSheet = localStorage.getItem('operacoes_sheet_url');
  
  if (financeiroScript) scriptUrls.financeiro = financeiroScript;
  if (clientesScript) scriptUrls.clientes = clientesScript;
  if (operacoesScript) scriptUrls.operacoes = operacoesScript;
  
  if (financeiroSheet) FINANCEIRO_SHEET_URL = financeiroSheet;
  if (clientesSheet) CLIENTES_SHEET_URL = clientesSheet;
  if (operacoesSheet) OPERACOES_SHEET_URL = operacoesSheet;
})();

// Função auxiliar para obter a URL do script correta com base no tipo
export function getScriptUrl(type: 'financeiro' | 'clientes' | 'operacoes'): string {
  return scriptUrls[type];
}

// Funções de sincronização com Google Sheets
export async function syncWithGoogleSheets(
  transactions: FinancialTransaction[],
  customers: Customer[],
  products: Product[],
  suppliers: Supplier[]
): Promise<void> {
  try {
    // Sincronizar transações
    await exportTransactionsToSheet(transactions);
    
    // Sincronizar clientes
    await exportCustomersToSheet(customers);
    
    // Sincronizar produtos e fornecedores
    await exportProductsToSheet(products);
    
    syncLog.addLog("Sincronização", "success", "Sincronização completa com Google Sheets");
  } catch (error: any) {
    syncLog.addLog("Sincronização", "error", `Erro na sincronização: ${error.message || error.toString()}`);
    throw error;
  }
}

export async function exportTransactionsToSheet(transactions: FinancialTransaction[]): Promise<void> {
  const url = getScriptUrl('financeiro');
  
  // Verificar se a URL está configurada
  if (!url || url === FINANCEIRO_SCRIPT_URL) {
    syncLog.addLog("Exportar Transações", "error", "URL do script para Financeiro não configurada");
    throw new Error("URL do script para Financeiro não configurada. Configure-a em Configurações > Integrações.");
  }
  
  try {
    syncLog.addLog("Exportar Transações", "info", `Enviando ${transactions.length} transações para o Google Sheets`);
    
    const response = await fetch(url + '?action=exportTransactions', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactions }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      syncLog.addLog("Exportar Transações", "error", `Erro ao exportar transações: ${response.status} - ${errorText}`);
      throw new Error(`Erro ao exportar transações: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      syncLog.addLog("Exportar Transações", "error", `Erro no script: ${data.error || 'Erro desconhecido'}`);
      throw new Error(`Erro no script: ${data.error || 'Erro desconhecido'}`);
    }
    
    syncLog.addLog("Exportar Transações", "success", "Transações exportadas com sucesso");
  } catch (error: any) {
    syncLog.addLog("Exportar Transações", "error", `Erro ao enviar dados: ${error.message || error.toString()}`);
    if (error instanceof Error) {
      throw new Error(`Erro ao exportar transações: ${error.message}`);
    } else {
      throw new Error(`Erro ao exportar transações: ${error}`);
    }
  }
}

export async function exportCustomersToSheet(customers: Customer[]): Promise<void> {
  const url = getScriptUrl('clientes');
  
  // Verificar se a URL está configurada
  if (!url || url === CLIENTES_SCRIPT_URL) {
    syncLog.addLog("Exportar Clientes", "error", "URL do script para Clientes não configurada");
    throw new Error("URL do script para Clientes não configurada. Configure-a em Configurações > Integrações.");
  }
  
  try {
    syncLog.addLog("Exportar Clientes", "info", `Enviando ${customers.length} clientes para o Google Sheets`);
    
    const response = await fetch(url + '?action=exportCustomers', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customers }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      syncLog.addLog("Exportar Clientes", "error", `Erro ao exportar clientes: ${response.status} - ${errorText}`);
      throw new Error(`Erro ao exportar clientes: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      syncLog.addLog("Exportar Clientes", "error", `Erro no script: ${data.error || 'Erro desconhecido'}`);
      throw new Error(`Erro no script: ${data.error || 'Erro desconhecido'}`);
    }
    
    syncLog.addLog("Exportar Clientes", "success", "Clientes exportados com sucesso");
  } catch (error: any) {
    syncLog.addLog("Exportar Clientes", "error", `Erro ao enviar dados: ${error.message || error.toString()}`);
    if (error instanceof Error) {
      throw new Error(`Erro ao exportar clientes: ${error.message}`);
    } else {
      throw new Error(`Erro ao exportar clientes: ${error}`);
    }
  }
}

export async function exportProductsToSheet(products: Product[]): Promise<void> {
  const url = getScriptUrl('operacoes');
  
  // Verificar se a URL está configurada
  if (!url || url === OPERACOES_SCRIPT_URL) {
    syncLog.addLog("Exportar Produtos", "error", "URL do script para Operações não configurada");
    throw new Error("URL do script para Operações não configurada. Configure-a em Configurações > Integrações.");
  }
  
  try {
    syncLog.addLog("Exportar Produtos", "info", `Enviando ${products.length} produtos para o Google Sheets`);
    
    const response = await fetch(url + '?action=exportProducts', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      syncLog.addLog("Exportar Produtos", "error", `Erro ao exportar produtos: ${response.status} - ${errorText}`);
      throw new Error(`Erro ao exportar produtos: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      syncLog.addLog("Exportar Produtos", "error", `Erro no script: ${data.error || 'Erro desconhecido'}`);
      throw new Error(`Erro no script: ${data.error || 'Erro desconhecido'}`);
    }
    
    syncLog.addLog("Exportar Produtos", "success", "Produtos exportados com sucesso");
  } catch (error: any) {
    syncLog.addLog("Exportar Produtos", "error", `Erro ao enviar dados: ${error.message || error.toString()}`);
    if (error instanceof Error) {
      throw new Error(`Erro ao exportar produtos: ${error.message}`);
    } else {
      throw new Error(`Erro ao exportar produtos: ${error}`);
    }
  }
}

export async function importFromGoogleSheets(): Promise<{
  transactions: FinancialTransaction[];
  customers: Customer[];
  products: Product[];
  suppliers: Supplier[];
} | null> {
  try {
    syncLog.addLog("Importar Dados", "info", "Iniciando importação de dados do Google Sheets");
    
    // Verificar se as URLs estão configuradas
    const financeiroUrl = getScriptUrl('financeiro');
    const clientesUrl = getScriptUrl('clientes');
    const operacoesUrl = getScriptUrl('operacoes');
    
    if (!financeiroUrl || !clientesUrl || !operacoesUrl || 
        financeiroUrl === FINANCEIRO_SCRIPT_URL || 
        clientesUrl === CLIENTES_SCRIPT_URL || 
        operacoesUrl === OPERACOES_SCRIPT_URL) {
      syncLog.addLog("Importar Dados", "error", "URLs dos scripts não configuradas");
      throw new Error("URLs dos scripts não configuradas. Configure-as em Configurações > Integrações.");
    }
    
    // Importar transações
    const transactions = await importTransactionsFromSheet();
    
    // Importar clientes
    const customers = await importCustomersFromSheet();
    
    // Importar produtos e fornecedores
    const { products, suppliers } = await importOperationsFromSheet();
    
    syncLog.addLog("Importar Dados", "success", "Dados importados com sucesso do Google Sheets");
    
    return {
      transactions,
      customers,
      products,
      suppliers,
    };
  } catch (error: any) {
    syncLog.addLog("Importar Dados", "error", `Erro ao importar dados: ${error.message || error.toString()}`);
    console.error("Erro ao importar dados do Google Sheets:", error);
    throw error;
  }
}

async function importTransactionsFromSheet(): Promise<FinancialTransaction[]> {
  const url = getScriptUrl('financeiro');
  try {
    syncLog.addLog("Importar Transações", "info", "Iniciando importação de transações");
    
    const response = await fetch(url + '?action=importTransactions', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      syncLog.addLog("Importar Transações", "error", `Erro ao importar transações: ${response.status} - ${errorText}`);
      throw new Error(`Erro ao importar transações: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      syncLog.addLog("Importar Transações", "error", `Erro no script: ${data.error || 'Erro desconhecido'}`);
      throw new Error(`Erro no script: ${data.error || 'Erro desconhecido'}`);
    }
    
    const count = data.data ? data.data.length : 0;
    syncLog.addLog("Importar Transações", "success", `${count} transações importadas com sucesso`);
    return data.data || [];
  } catch (error: any) {
    syncLog.addLog("Importar Transações", "error", `Erro ao importar transações: ${error.message || error.toString()}`);
    console.error("Erro ao importar transações do Google Sheets:", error);
    return [];
  }
}

async function importCustomersFromSheet(): Promise<Customer[]> {
  const url = getScriptUrl('clientes');
  try {
    syncLog.addLog("Importar Clientes", "info", "Iniciando importação de clientes");
    
    const response = await fetch(url + '?action=importCustomers', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      syncLog.addLog("Importar Clientes", "error", `Erro ao importar clientes: ${response.status} - ${errorText}`);
      throw new Error(`Erro ao importar clientes: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      syncLog.addLog("Importar Clientes", "error", `Erro no script: ${data.error || 'Erro desconhecido'}`);
      throw new Error(`Erro no script: ${data.error || 'Erro desconhecido'}`);
    }
    
    const count = data.data ? data.data.length : 0;
    syncLog.addLog("Importar Clientes", "success", `${count} clientes importados com sucesso`);
    return data.data || [];
  } catch (error: any) {
    syncLog.addLog("Importar Clientes", "error", `Erro ao importar clientes: ${error.message || error.toString()}`);
    console.error("Erro ao importar clientes do Google Sheets:", error);
    return [];
  }
}

async function importOperationsFromSheet(): Promise<{ products: Product[]; suppliers: Supplier[]; }> {
  const url = getScriptUrl('operacoes');
  try {
    syncLog.addLog("Importar Operações", "info", "Iniciando importação de produtos e fornecedores");
    
    const response = await fetch(url + '?action=importOperations', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      syncLog.addLog("Importar Operações", "error", `Erro ao importar operações: ${response.status} - ${errorText}`);
      throw new Error(`Erro ao importar operações: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      syncLog.addLog("Importar Operações", "error", `Erro no script: ${data.error || 'Erro desconhecido'}`);
      throw new Error(`Erro no script: ${data.error || 'Erro desconhecido'}`);
    }
    
    const productsCount = data.data?.products ? data.data.products.length : 0;
    const suppliersCount = data.data?.suppliers ? data.data.suppliers.length : 0;
    syncLog.addLog("Importar Operações", "success", `${productsCount} produtos e ${suppliersCount} fornecedores importados com sucesso`);
    
    return {
      products: data.data?.products || [],
      suppliers: data.data?.suppliers || []
    };
  } catch (error: any) {
    syncLog.addLog("Importar Operações", "error", `Erro ao importar operações: ${error.message || error.toString()}`);
    console.error("Erro ao importar operações do Google Sheets:", error);
    return { products: [], suppliers: [] };
  }
}
