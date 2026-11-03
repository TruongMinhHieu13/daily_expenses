/**
 * Financial Ledger Types & Interfaces
 */

export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'bank' | 'e_wallet';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isCustom?: boolean;
  userId?: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  createdAt: number;
  updatedAt?: number;
}

export interface UserSettings {
  hideBalance: boolean;
  pinEnabled: boolean;
  pinCode: string;
  currency: 'VND';
  monthlyBudget: number;
}

export interface MonthSummary {
  monthStr: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
}
