
import { 
  FinancialTransaction, 
  Customer, 
  Product, 
  Supplier 
} from "@/types/models";

// Types for Supabase data mapping
export type SupabaseTransaction = FinancialTransaction & {
  user_id?: string;
};

export type SupabaseCustomer = Customer & {
  user_id?: string;
};

export type SupabaseProduct = Product & {
  user_id?: string;
};

export type SupabaseSupplier = Supplier & {
  user_id?: string;
};

// Helper functions to convert between application models and database models
export const toAppTransaction = (dbTransaction: any): FinancialTransaction => {
  // Remove user_id from the database record
  const { user_id, ...transaction } = dbTransaction;
  return transaction as FinancialTransaction;
};

export const toDbTransaction = (transaction: FinancialTransaction, userId: string): SupabaseTransaction => {
  return {
    ...transaction,
    user_id: userId
  };
};

export const toAppCustomer = (dbCustomer: any): Customer => {
  const { user_id, ...customer } = dbCustomer;
  return customer as Customer;
};

export const toDbCustomer = (customer: Customer, userId: string): SupabaseCustomer => {
  return {
    ...customer,
    user_id: userId
  };
};

export const toAppProduct = (dbProduct: any): Product => {
  const { user_id, ...product } = dbProduct;
  return product as Product;
};

export const toDbProduct = (product: Product, userId: string): SupabaseProduct => {
  return {
    ...product,
    user_id: userId
  };
};

export const toAppSupplier = (dbSupplier: any): Supplier => {
  const { user_id, ...supplier } = dbSupplier;
  return supplier as Supplier;
};

export const toDbSupplier = (supplier: Supplier, userId: string): SupabaseSupplier => {
  return {
    ...supplier,
    user_id: userId
  };
};
