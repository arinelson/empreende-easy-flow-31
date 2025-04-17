
// Login credentials
// Use environment variables in production
export const USER = "admin";
export const PASSWORD = "admin12345";

// Google Sheets integration
// Replace with your own API URL
export const SHEET_URL = "https://script.google.com/macros/s/your-google-script-id";

// Types for various data models

export interface User {
  username: string;
  avatar?: string;
  theme?: 'light' | 'dark';
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paymentMethod?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  joinDate: string;
  totalPurchases: number;
  lastPurchase?: string;
  notes?: string;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  category: string;
  minimumStock?: number;
  supplier?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone: string;
  address?: string;
  products?: string[];
}

// Dashboard types
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  customersCount: number;
  productsCount: number;
  lowStockCount: number;
}

// Theme options
export const themes = {
  light: { 
    primary: "var(--primary)", 
    secondary: "var(--secondary)",
    background: "var(--background)",
    foreground: "var(--foreground)"  
  },
  dark: { 
    primary: "var(--primary)", 
    secondary: "var(--secondary)",
    background: "var(--background)",
    foreground: "var(--foreground)" 
  },
};
