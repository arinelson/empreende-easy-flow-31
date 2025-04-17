
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
  exportProductsToSheet
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
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    customersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
  });

  // Load initial data from localStorage
  useEffect(() => {
    setTransactions(getTransactions());
    setCustomers(getCustomers());
    setProducts(getProducts());
    setSuppliers(getSuppliers());
  }, []);

  // Update dashboard summary whenever data changes
  useEffect(() => {
    updateDashboardSummary();
  }, [transactions, customers, products]);

  const updateDashboardSummary = () => {
    // Calculate financial summary
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Count customers
    const customersCount = customers.length;
    
    // Count products and low stock
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

  // Transaction methods
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

  // Customer methods
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

  // Product methods
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

  // Supplier methods
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

  // Google Sheets sync
  const syncWithSheet = async () => {
    try {
      await syncWithGoogleSheets(transactions, customers, products, suppliers);
    } catch (error) {
      console.error("Error syncing with Google Sheets:", error);
      toast.error("Erro ao sincronizar com Google Sheets.");
    }
  };

  const exportToSheet = async (type: 'transactions' | 'customers' | 'products') => {
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
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      toast.error(`Erro ao exportar ${type}.`);
    }
  };

  // Clear all data
  const clearData = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      setTransactions([]);
      setCustomers([]);
      setProducts([]);
      setSuppliers([]);
      clearAllData();
      toast.success("Todos os dados foram limpos com sucesso.");
    }
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
        clearData,
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
