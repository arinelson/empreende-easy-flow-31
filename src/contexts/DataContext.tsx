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
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  toAppTransaction,
  toDbTransaction,
  toAppCustomer,
  toDbCustomer,
  toAppProduct,
  toDbProduct,
  toAppSupplier,
  toDbSupplier
} from "@/types/supabase";

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
  syncWithDatabase: () => Promise<void>;
  clearData: () => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    customersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    // Load data from localStorage first for instant UI rendering
    setTransactions(getTransactions());
    setCustomers(getCustomers());
    setProducts(getProducts());
    setSuppliers(getSuppliers());

    // Then try to load from Supabase if user is logged in
    if (user) {
      refreshData();
    }
  }, [user]);

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

  const refreshData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch transactions from Supabase
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);
      
      if (transactionError) throw transactionError;
      
      const mappedTransactions = transactionData.map(toAppTransaction);
      setTransactions(mappedTransactions);
      saveTransactions(mappedTransactions);
      
      // Fetch customers from Supabase
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id);
      
      if (customerError) throw customerError;
      
      const mappedCustomers = customerData.map(toAppCustomer);
      setCustomers(mappedCustomers);
      saveCustomers(mappedCustomers);
      
      // Fetch products from Supabase
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);
      
      if (productError) throw productError;
      
      const mappedProducts = productData.map(toAppProduct);
      setProducts(mappedProducts);
      saveProducts(mappedProducts);
      
      // Fetch suppliers from Supabase
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id);
      
      if (supplierError) throw supplierError;
      
      const mappedSuppliers = supplierData.map(toAppSupplier);
      setSuppliers(mappedSuppliers);
      saveSuppliers(mappedSuppliers);

      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do banco de dados");
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<FinancialTransaction, 'id'>) => {
    const newTransaction: FinancialTransaction = {
      ...transaction,
      id: uuidv4(),
    };

    // Update local state
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    // Save to Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('transactions')
          .insert(toDbTransaction(newTransaction, user.id));

        if (error) throw error;
      } catch (error) {
        console.error("Error adding transaction to database:", error);
        toast.error("Erro ao salvar transação no banco de dados");
      }
    }

    toast.success("Transação adicionada com sucesso!");
  };

  const updateTransaction = async (id: string, data: Partial<FinancialTransaction>) => {
    const updatedTransactions = transactions.map(transaction => 
      transaction.id === id ? { ...transaction, ...data } : transaction
    );
    
    // Update local state
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    // Update in Supabase if user is logged in
    if (user) {
      try {
        const transaction = updatedTransactions.find(t => t.id === id);
        if (transaction) {
          const { error } = await supabase
            .from('transactions')
            .update(toDbTransaction(transaction, user.id))
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;
        }
      } catch (error) {
        console.error("Error updating transaction in database:", error);
        toast.error("Erro ao atualizar transação no banco de dados");
      }
    }

    toast.success("Transação atualizada com sucesso!");
  };

  const deleteTransaction = async (id: string) => {
    const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
    
    // Update local state
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    // Delete from Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error deleting transaction from database:", error);
        toast.error("Erro ao excluir transação do banco de dados");
      }
    }

    toast.success("Transação removida com sucesso!");
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4(),
    };
    
    // Update local state
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);

    // Save to Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('customers')
          .insert(toDbCustomer(newCustomer, user.id));

        if (error) throw error;
      } catch (error) {
        console.error("Error adding customer to database:", error);
        toast.error("Erro ao salvar cliente no banco de dados");
      }
    }

    toast.success("Cliente adicionado com sucesso!");
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === id ? { ...customer, ...data } : customer
    );
    
    // Update local state
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);

    // Update in Supabase if user is logged in
    if (user) {
      try {
        const customer = updatedCustomers.find(c => c.id === id);
        if (customer) {
          const { error } = await supabase
            .from('customers')
            .update(toDbCustomer(customer, user.id))
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;
        }
      } catch (error) {
        console.error("Error updating customer in database:", error);
        toast.error("Erro ao atualizar cliente no banco de dados");
      }
    }

    toast.success("Cliente atualizado com sucesso!");
  };

  const deleteCustomer = async (id: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    
    // Update local state
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);

    // Delete from Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error deleting customer from database:", error);
        toast.error("Erro ao excluir cliente do banco de dados");
      }
    }

    toast.success("Cliente removido com sucesso!");
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
    };
    
    // Update local state
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    // Save to Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('products')
          .insert(toDbProduct(newProduct, user.id));

        if (error) throw error;
      } catch (error) {
        console.error("Error adding product to database:", error);
        toast.error("Erro ao salvar produto no banco de dados");
      }
    }

    toast.success("Produto adicionado com sucesso!");
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, ...data } : product
    );
    
    // Update local state
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    // Update in Supabase if user is logged in
    if (user) {
      try {
        const product = updatedProducts.find(p => p.id === id);
        if (product) {
          const { error } = await supabase
            .from('products')
            .update(toDbProduct(product, user.id))
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;
        }
      } catch (error) {
        console.error("Error updating product in database:", error);
        toast.error("Erro ao atualizar produto no banco de dados");
      }
    }

    toast.success("Produto atualizado com sucesso!");
  };

  const deleteProduct = async (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    
    // Update local state
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    // Delete from Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error deleting product from database:", error);
        toast.error("Erro ao excluir produto do banco de dados");
      }
    }

    toast.success("Produto removido com sucesso!");
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: uuidv4(),
    };
    
    // Update local state
    const updatedSuppliers = [...suppliers, newSupplier];
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);

    // Save to Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('suppliers')
          .insert(toDbSupplier(newSupplier, user.id));

        if (error) throw error;
      } catch (error) {
        console.error("Error adding supplier to database:", error);
        toast.error("Erro ao salvar fornecedor no banco de dados");
      }
    }

    toast.success("Fornecedor adicionado com sucesso!");
  };

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    const updatedSuppliers = suppliers.map(supplier => 
      supplier.id === id ? { ...supplier, ...data } : supplier
    );
    
    // Update local state
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);

    // Update in Supabase if user is logged in
    if (user) {
      try {
        const supplier = updatedSuppliers.find(s => s.id === id);
        if (supplier) {
          const { error } = await supabase
            .from('suppliers')
            .update(toDbSupplier(supplier, user.id))
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;
        }
      } catch (error) {
        console.error("Error updating supplier in database:", error);
        toast.error("Erro ao atualizar fornecedor no banco de dados");
      }
    }

    toast.success("Fornecedor atualizado com sucesso!");
  };

  const deleteSupplier = async (id: string) => {
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
    
    // Update local state
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);

    // Delete from Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('suppliers')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error deleting supplier from database:", error);
        toast.error("Erro ao excluir fornecedor do banco de dados");
      }
    }

    toast.success("Fornecedor removido com sucesso!");
  };

  const syncWithDatabase = async () => {
    if (!user) {
      toast.warning("Você precisa estar logado para sincronizar com o banco de dados");
      return;
    }
    
    setIsLoading(true);
    try {
      toast.info("Sincronizando dados com o banco de dados...");

      // Sync transactions
      for (const transaction of transactions) {
        const { error: upsertError } = await supabase
          .from('transactions')
          .upsert(toDbTransaction(transaction, user.id))
          .eq('user_id', user.id);

        if (upsertError) throw upsertError;
      }

      // Sync customers
      for (const customer of customers) {
        const { error: upsertError } = await supabase
          .from('customers')
          .upsert(toDbCustomer(customer, user.id))
          .eq('user_id', user.id);

        if (upsertError) throw upsertError;
      }

      // Sync products
      for (const product of products) {
        const { error: upsertError } = await supabase
          .from('products')
          .upsert(toDbProduct(product, user.id))
          .eq('user_id', user.id);

        if (upsertError) throw upsertError;
      }

      // Sync suppliers
      for (const supplier of suppliers) {
        const { error: upsertError } = await supabase
          .from('suppliers')
          .upsert(toDbSupplier(supplier, user.id))
          .eq('user_id', user.id);

        if (upsertError) throw upsertError;
      }

      toast.success("Dados sincronizados com o banco de dados");
    } catch (error) {
      console.error("Erro ao sincronizar com o banco de dados:", error);
      toast.error("Erro ao sincronizar com o banco de dados");
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = async () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      // Clear local storage
      setTransactions([]);
      setCustomers([]);
      setProducts([]);
      setSuppliers([]);
      clearAllData();

      // Delete from Supabase if user is logged in
      if (user) {
        setIsLoading(true);
        try {
          toast.info("Removendo dados do banco de dados...");
          
          // Delete all user's transactions
          const { error: transactionError } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', user.id);
          
          if (transactionError) throw transactionError;
          
          // Delete all user's customers
          const { error: customerError } = await supabase
            .from('customers')
            .delete()
            .eq('user_id', user.id);
          
          if (customerError) throw customerError;
          
          // Delete all user's products
          const { error: productError } = await supabase
            .from('products')
            .delete()
            .eq('user_id', user.id);
          
          if (productError) throw productError;
          
          // Delete all user's suppliers
          const { error: supplierError } = await supabase
            .from('suppliers')
            .delete()
            .eq('user_id', user.id);
          
          if (supplierError) throw supplierError;
          
        } catch (error) {
          console.error("Error clearing data from database:", error);
          toast.error("Erro ao limpar dados do banco de dados");
        } finally {
          setIsLoading(false);
        }
      }
      
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
        syncWithDatabase,
        clearData,
        isLoading,
        refreshData,
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
