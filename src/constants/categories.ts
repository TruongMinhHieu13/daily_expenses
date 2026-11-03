import { Category, Transaction } from '../types/finance';

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  {
    id: 'inc_salary',
    name: 'Lương',
    type: 'income',
    icon: 'Briefcase',
    color: '#10B981', // Emerald
  },
  {
    id: 'inc_bonus',
    name: 'Thưởng',
    type: 'income',
    icon: 'Gift',
    color: '#F59E0B', // Amber
  },
  {
    id: 'inc_business',
    name: 'Kinh doanh',
    type: 'income',
    icon: 'TrendingUp',
    color: '#3B82F6', // Blue
  },
  {
    id: 'inc_sidejob',
    name: 'Làm thêm',
    type: 'income',
    icon: 'Laptop',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'inc_other',
    name: 'Thu nhập khác',
    type: 'income',
    icon: 'PiggyBank',
    color: '#06B6D4', // Cyan
  },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'exp_food',
    name: 'Ăn uống',
    type: 'expense',
    icon: 'Utensils',
    color: '#EF4444', // Red
  },
  {
    id: 'exp_transport',
    name: 'Đi lại',
    type: 'expense',
    icon: 'Car',
    color: '#F97316', // Orange
  },
  {
    id: 'exp_shopping',
    name: 'Mua sắm',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#EC4899', // Pink
  },
  {
    id: 'exp_bills',
    name: 'Hóa đơn',
    type: 'expense',
    icon: 'Receipt',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'exp_housing',
    name: 'Nhà cửa',
    type: 'expense',
    icon: 'Home',
    color: '#6366F1', // Indigo
  },
  {
    id: 'exp_entertainment',
    name: 'Giải trí',
    type: 'expense',
    icon: 'Gamepad2',
    color: '#14B8A6', // Teal
  },
  {
    id: 'exp_health',
    name: 'Sức khỏe',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#E11D48', // Rose
  },
  {
    id: 'exp_family',
    name: 'Gia đình',
    type: 'expense',
    icon: 'Users',
    color: '#D97706', // Yellow-amber
  },
  {
    id: 'exp_personal',
    name: 'Chi phí cá nhân',
    type: 'expense',
    icon: 'UserCheck',
    color: '#0284C7', // Sky
  },
  {
    id: 'exp_other',
    name: 'Khoản chi khác',
    type: 'expense',
    icon: 'Tag',
    color: '#64748B', // Slate
  },
];

export const ALL_DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_EXPENSE_CATEGORIES,
];

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils', 'Car', 'ShoppingBag', 'Receipt', 'Home', 'Gamepad2',
  'HeartPulse', 'Users', 'UserCheck', 'Tag', 'Briefcase', 'Gift',
  'TrendingUp', 'Laptop', 'PiggyBank', 'Coffee', 'Fuel', 'Plane',
  'GraduationCap', 'Smartphone', 'Film', 'Dumbbell', 'Music', 'Sparkles'
];

export const CATEGORY_COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
];

/**
 * Returns empty initial transaction list for a fresh start.
 */
export function generateInitialSampleTransactions(): Transaction[] {
  return [];
}

