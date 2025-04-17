
// Service to handle localStorage operations
import { FinancialTransaction, Customer, Product, Supplier, User } from "@/types/models";

// Keys for localStorage
const KEYS = {
  THEME: 'empreende-easy-flow-theme',
  USER: 'empreende-easy-flow-user',
  TRANSACTIONS: 'empreende-easy-flow-transactions',
  CUSTOMERS: 'empreende-easy-flow-customers',
  PRODUCTS: 'empreende-easy-flow-products',
  SUPPLIERS: 'empreende-easy-flow-suppliers',
  AUTH: 'empreende-easy-flow-auth',
};

// Theme service
export const getTheme = (): 'light' | 'dark' => {
  const theme = localStorage.getItem(KEYS.THEME);
  return theme === 'dark' ? 'dark' : 'light';
};

export const setTheme = (theme: 'light' | 'dark'): void => {
  localStorage.setItem(KEYS.THEME, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// User service
export const getUser = (): User | null => {
  const user = localStorage.getItem(KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

// Auth service
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(KEYS.AUTH) === 'true';
};

export const setAuthenticated = (status: boolean): void => {
  localStorage.setItem(KEYS.AUTH, status.toString());
};

export const logout = (): void => {
  localStorage.removeItem(KEYS.AUTH);
};

// Financial transactions
export const getTransactions = (): FinancialTransaction[] => {
  const transactions = localStorage.getItem(KEYS.TRANSACTIONS);
  return transactions ? JSON.parse(transactions) : [];
};

export const setTransactions = (transactions: FinancialTransaction[]): void => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const addTransaction = (transaction: FinancialTransaction): FinancialTransaction[] => {
  const transactions = getTransactions();
  const updatedTransactions = [...transactions, transaction];
  setTransactions(updatedTransactions);
  return updatedTransactions;
};

// Customers
export const getCustomers = (): Customer[] => {
  const customers = localStorage.getItem(KEYS.CUSTOMERS);
  return customers ? JSON.parse(customers) : [];
};

export const setCustomers = (customers: Customer[]): void => {
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const addCustomer = (customer: Customer): Customer[] => {
  const customers = getCustomers();
  const updatedCustomers = [...customers, customer];
  setCustomers(updatedCustomers);
  return updatedCustomers;
};

// Products
export const getProducts = (): Product[] => {
  const products = localStorage.getItem(KEYS.PRODUCTS);
  return products ? JSON.parse(products) : [];
};

export const setProducts = (products: Product[]): void => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const addProduct = (product: Product): Product[] => {
  const products = getProducts();
  const updatedProducts = [...products, product];
  setProducts(updatedProducts);
  return updatedProducts;
};

// Suppliers
export const getSuppliers = (): Supplier[] => {
  const suppliers = localStorage.getItem(KEYS.SUPPLIERS);
  return suppliers ? JSON.parse(suppliers) : [];
};

export const setSuppliers = (suppliers: Supplier[]): void => {
  localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(suppliers));
};

export const addSupplier = (supplier: Supplier): Supplier[] => {
  const suppliers = getSuppliers();
  const updatedSuppliers = [...suppliers, supplier];
  setSuppliers(updatedSuppliers);
  return updatedSuppliers;
};

// Clear all data
export const clearAllData = (): void => {
  localStorage.removeItem(KEYS.TRANSACTIONS);
  localStorage.removeItem(KEYS.CUSTOMERS);
  localStorage.removeItem(KEYS.PRODUCTS);
  localStorage.removeItem(KEYS.SUPPLIERS);
};
