import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  FinancialTransaction, 
  Customer, 
  Product, 
  Supplier,
  DashboardSummary 
} from "@/types/models";
import { 
  getTransactions, 
  setTransactions as saveTransactions,
  getCustomers, 
  setCustomers as saveCustomers, 
  getProducts, 
  setProducts as saveProducts,
  getSuppliers, 
  setSuppliers as saveSuppliers,
  clearAllData
} from "@/services/localStorage";
import { 
  syncWithGoogleSheets,
  exportTransactionsToSheet,
  exportCustomersToSheet,
  exportProductsToSheet,
  importFromGoogleSheets,
  syncLog
} from "@/services/googleSheets";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface DataContextType {
  transactions: FinancialTransaction[];
  customers: Customer[];
  products: Product[];
  suppliers: Supplier[];
  dashboardSummary: DashboardSummary;
  addTransaction: (transaction: Omit<FinancialTransaction, 'id'>) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateTransaction: (id: string, data: Partial<FinancialTransaction>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteTransaction: (id: string) => void;
  deleteCustomer: (id: string) => void;
  deleteProduct: (id: string) => void;
  deleteSupplier: (id: string) => void;
  syncWithSheet: () => Promise<void>;
  exportToSheet: (type: 'transactions' | 'customers' | 'products') => Promise<void>;
  importFromSheet: () => Promise<void>;
  clearData: () => void;
  isLoading: boolean;
  getSyncLogs: () => Array<{timestamp: string, action: string, status: string, details?: string}>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    customersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    setTransactions(getTransactions());
    setCustomers(getCustomers());
    setProducts(getProducts());
    setSuppliers(getSuppliers());
  }, []);

  useEffect(() => {
    updateDashboardSummary();
  }, [transactions, customers, products]);

  const updateDashboardSummary = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    const customersCount = customers.length;
    
    const productsCount = products.length;
    const lowStockCount = products.filter(p => p.stock < (p.minimumStock || 10)).length;
    
    setDashboardSummary({
      totalIncome,
      totalExpenses,
      balance,
      customersCount,
      productsCount,
      lowStockCount,
    });
  };

  const addTransaction = (transaction: Omit<FinancialTransaction, 'id'>) => {
    const newTransaction: FinancialTransaction = {
      ...transaction,
      id: uuidv4(),
    };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    toast.success("Transação adicionada com sucesso!");
  };

  const updateTransaction = (id: string, data: Partial<FinancialTransaction>) => {
    const updatedTransactions = transactions.map(transaction => 
      transaction.id === id ? { ...transaction, ...data } : transaction
    );
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    toast.success("Transação atualizada com sucesso!");
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    toast.success("Transação removida com sucesso!");
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4(),
    };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);
    toast.success("Cliente adicionado com sucesso!");
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === id ? { ...customer, ...data } : customer
    );
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);
    toast.success("Cliente atualizado com sucesso!");
  };

  const deleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);
    toast.success("Cliente removido com sucesso!");
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    toast.success("Produto adicionado com sucesso!");
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, ...data } : product
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    toast.success("Produto atualizado com sucesso!");
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    toast.success("Produto removido com sucesso!");
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: uuidv4(),
    };
    const updatedSuppliers = [...suppliers, newSupplier];
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);
    toast.success("Fornecedor adicionado com sucesso!");
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    const updatedSuppliers = suppliers.map(supplier => 
      supplier.id === id ? { ...supplier, ...data } : supplier
    );
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);
    toast.success("Fornecedor atualizado com sucesso!");
  };

  const deleteSupplier = (id: string) => {
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);
    toast.success("Fornecedor removido com sucesso!");
  };

  const syncWithSheet = async () => {
    if (isLoading) {
      toast.warning("Sincronização já em andamento. Aguarde...");
      return;
    }
    
    try {
      setIsLoading(true);
      toast.info("Sincronizando com Google Sheets...");
      
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!success && attempts < maxAttempts) {
        attempts++;
        try {
          await syncWithGoogleSheets(transactions, customers, products, suppliers);
          success = true;
        } catch (error) {
          console.error(`Tentativa ${attempts} falhou:`, error);
          if (attempts === maxAttempts) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast.success("Dados sincronizados com Google Sheets com sucesso!");
      
      try {
        const importedData = await importFromGoogleSheets();
        if (importedData) {
          setTransactions(importedData.transactions);
          saveTransactions(importedData.transactions);
          
          setCustomers(importedData.customers);
          saveCustomers(importedData.customers);
          
          setProducts(importedData.products);
          saveProducts(importedData.products);
          
          setSuppliers(importedData.suppliers);
          saveSuppliers(importedData.suppliers);
          
          toast.success("Dados atualizados com sucesso do Google Sheets!");
        }
      } catch (importError) {
        console.error("Erro ao importar dados após sincronização:", importError);
      }
    } catch (error) {
      console.error("Erro ao sincronizar com Google Sheets:", error);
      toast.error("Erro ao sincronizar com Google Sheets. Verifique os logs para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToSheet = async (type: 'transactions' | 'customers' | 'products') => {
    if (isLoading) {
      toast.warning("Exportação já em andamento. Aguarde...");
      return;
    }
    
    try {
      setIsLoading(true);
      toast.info(`Exportando ${type === 'transactions' ? 'transações' : type === 'customers' ? 'clientes' : 'produtos'}...`);
      
      let success = false;
      let attempts = 0;
      const maxAttempts = 2;
      
      while (!success && attempts < maxAttempts) {
        attempts++;
        try {
          switch (type) {
            case 'transactions':
              await exportTransactionsToSheet(transactions);
              break;
            case 'customers':
              await exportCustomersToSheet(customers);
              break;
            case 'products':
              await exportProductsToSheet(products);
              break;
          }
          success = true;
        } catch (error) {
          console.error(`Tentativa ${attempts} falhou:`, error);
          if (attempts === maxAttempts) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast.success(`${type === 'transactions' ? 'Transações' : type === 'customers' ? 'Clientes' : 'Produtos'} exportados com sucesso!`);
    } catch (error) {
      console.error(`Erro ao exportar ${type}:`, error);
      toast.error(`Erro ao exportar ${type}. Verifique os logs para mais detalhes.`);
    } finally {
      setIsLoading(false);
    }
  };

  const importFromSheet = async () => {
    if (isLoading) {
      toast.warning("Importação já em andamento. Aguarde...");
      return;
    }
    
    try {
      setIsLoading(true);
      toast.info("Importando dados do Google Sheets...");
      
      let data = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!data && attempts < maxAttempts) {
        attempts++;
        try {
          data = await importFromGoogleSheets();
          if (!data) throw new Error("Dados importados são nulos");
        } catch (error) {
          console.error(`Tentativa ${attempts} falhou:`, error);
          if (attempts === maxAttempts) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (data) {
        setTransactions(data.transactions);
        saveTransactions(data.transactions);
        
        setCustomers(data.customers);
        saveCustomers(data.customers);
        
        setProducts(data.products);
        saveProducts(data.products);
        
        setSuppliers(data.suppliers);
        saveSuppliers(data.suppliers);
        
        toast.success("Dados importados com sucesso do Google Sheets!");
        updateDashboardSummary();
      } else {
        toast.error("Não foi possível importar os dados do Google Sheets.");
      }
    } catch (error) {
      console.error("Erro ao importar do Google Sheets:", error);
      toast.error("Erro ao importar do Google Sheets. Verifique os logs para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      setTransactions([]);
      setCustomers([]);
      setProducts([]);
      setSuppliers([]);
      clearAllData();
      syncLog.clearLogs();
      toast.success("Todos os dados foram limpos com sucesso.");
    }
  };

  const getSyncLogs = () => {
    return syncLog.getLogs();
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        customers,
        products,
        suppliers,
        dashboardSummary,
        addTransaction,
        addCustomer,
        addProduct,
        addSupplier,
        updateTransaction,
        updateCustomer,
        updateProduct,
        updateSupplier,
        deleteTransaction,
        deleteCustomer,
        deleteProduct,
        deleteSupplier,
        syncWithSheet,
        exportToSheet,
        importFromSheet,
        clearData,
        isLoading,
        getSyncLogs,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
