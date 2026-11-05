import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  TrendingDown,
  TrendingUp,
  Tag,
  Wallet,
  CreditCard,
  Smartphone,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatVND, formatDateVN, formatMonthFullVN } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { MonthSelector } from './MonthSelector';
import { ReloadButton } from './ReloadButton';
import { Transaction, TransactionType } from '../types/finance';

interface LedgerTabProps {
  onEditTransaction: (tx: Transaction) => void;
  onOpenAddModal: () => void;
}

export const LedgerTab: React.FC<LedgerTabProps> = ({
  onEditTransaction,
  onOpenAddModal,
}) => {
  const { transactions, categories, selectedMonth, settings } = useFinance();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Category Lookup Map
  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof categories)[0]>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Month match (if not in search mode)
      if (selectedMonth && !tx.date.startsWith(selectedMonth)) {
        return false;
      }

      // 2. Type match
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // 3. Category match
      if (filterCategoryId !== 'all' && tx.categoryId !== filterCategoryId) {
        return false;
      }

      // 4. Payment method match
      if (filterPayment !== 'all' && tx.paymentMethod !== filterPayment) {
        return false;
      }

      // 5. Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const cat = categoryMap.get(tx.categoryId);
        const matchesNote = (tx.note || '').toLowerCase().includes(query);
        const matchesCat = (cat?.name || '').toLowerCase().includes(query);
        const matchesAmount = String(tx.amount).includes(query);
        if (!matchesNote && !matchesCat && !matchesAmount) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    selectedMonth,
    filterType,
    filterCategoryId,
    filterPayment,
    searchQuery,
    categoryMap,
  ]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.time || '').localeCompare(a.time || '');
    });

    const groups: {
      date: string;
      items: Transaction[];
      dayIncome: number;
      dayExpense: number;
    }[] = [];

    const map = new Map<string, Transaction[]>();
    for (const tx of sorted) {
      const list = map.get(tx.date) || [];
      list.push(tx);
      map.set(tx.date, list);
    }

    map.forEach((items, date) => {
      let dayIncome = 0;
      let dayExpense = 0;
      for (const item of items) {
        if (item.type === 'income') dayIncome += item.amount;
        else dayExpense += item.amount;
      }
      groups.push({ date, items, dayIncome, dayExpense });
    });

    return groups;
  }, [filteredTransactions]);

  // Totals for filtered transactions
  const { totalFilteredIncome, totalFilteredExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const tx of filteredTransactions) {
      if (tx.type === 'income') inc += tx.amount;
      else exp += tx.amount;
    }
    return { totalFilteredIncome: inc, totalFilteredExpense: exp };
  }, [filteredTransactions]);

  const activeFilterCount =
    (filterType !== 'all' ? 1 : 0) +
    (filterCategoryId !== 'all' ? 1 : 0) +
    (filterPayment !== 'all' ? 1 : 0);

  const resetAllFilters = () => {
    setFilterType('all');
    setFilterCategoryId('all');
    setFilterPayment('all');
    setSearchQuery('');
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-3.5">
      {/* Month Selector & Reload header */}
      <div className="flex items-center gap-2">
        <MonthSelector className="flex-1" />
        <ReloadButton />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs px-3 py-2 text-slate-800">
          <Search size={16} className="text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo ghi chú, danh mục, số tiền..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-transparent outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterDrawer(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold transition active:scale-95 shadow-2xs ${
            activeFilterCount > 0
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter size={15} />
          <span>Lọc</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-3xs font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick Filter Type Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl border transition ${
            filterType === 'all'
              ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tất cả ({filteredTransactions.length})
        </button>

        <button
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1 ${
            filterType === 'expense'
              ? 'bg-rose-500 border-rose-500 text-white shadow-2xs'
              : 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50'
          }`}
        >
          <TrendingDown size={13} />
          <span>Khoản Chi</span>
        </button>

        <button
          onClick={() => setFilterType('income')}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1 ${
            filterType === 'income'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
              : 'bg-white border-slate-200 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <TrendingUp size={13} />
          <span>Khoản Thu</span>
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 text-2xs font-bold transition shrink-0"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Subtotal Banner for Current View */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-2xs text-slate-400 font-medium uppercase tracking-wider">
            Tổng thu
          </span>
          <p className="font-bold font-mono-numbers text-emerald-600 mt-0.5">
            {settings.hideBalance ? '******' : `+${formatVND(totalFilteredIncome)}`}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xs text-slate-400 font-medium uppercase tracking-wider">
            Tổng chi
          </span>
          <p className="font-bold font-mono-numbers text-rose-500 mt-0.5">
            {settings.hideBalance ? '******' : `-${formatVND(totalFilteredExpense)}`}
          </p>
        </div>
      </div>

      {/* Chronological Daily Grouped Transaction Feed */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <Calendar size={22} />
          </div>
          <p className="text-sm font-bold text-slate-800">Không tìm thấy giao dịch nào</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {activeFilterCount > 0 || searchQuery
              ? 'Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm của bạn.'
              : 'Tháng này chưa có giao dịch nào được ghi lại.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs active:scale-95"
          >
            Thêm giao dịch mới
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {groupedByDate.map((group) => (
            <div
              key={group.date}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              {/* Daily Header with Subtotals */}
              <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {formatDateVN(group.date)}
                </span>
                <div className="flex items-center gap-2 font-mono-numbers text-2xs font-semibold">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-600">
                      +{formatVND(group.dayIncome, false)}
                    </span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-500">
                      -{formatVND(group.dayExpense, false)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in this day */}
              <div className="divide-y divide-slate-100">
                {group.items.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onEditTransaction(tx)}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50 active:bg-slate-100/80 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: cat?.color || '#10B981' }}
                        >
                          <CategoryIcon iconName={cat?.icon || 'Tag'} size={18} color="#FFFFFF" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {tx.note || cat?.name || 'Giao dịch'}
                          </p>
                          <div className="flex items-center gap-1.5 text-2xs text-slate-400 mt-0.5">
                            <span className="font-medium text-slate-500">{cat?.name}</span>
                            {tx.time && (
                              <>
                                <span>•</span>
                                <span>{tx.time}</span>
                              </>
                            )}
                            {tx.paymentMethod && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400">
                                  {tx.paymentMethod === 'cash'
                                    ? 'Tiền mặt'
                                    : tx.paymentMethod === 'bank'
                                    ? 'Chuyển khoản'
                                    : 'Ví điện tử'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <p
                          className={`text-xs font-bold font-mono-numbers ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {settings.hideBalance
                            ? '******'
                            : `${isIncome ? '+' : '-'}${formatVND(tx.amount)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Filter Drawer Modal */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl p-5 overflow-hidden animate-in slide-in-from-bottom duration-200"
            style={{ paddingBottom: 'calc(var(--sab) + 16px)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Bộ lọc nâng cao</h3>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-4 text-xs">
              {/* Filter By Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wider text-2xs">
                  Danh mục
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                  <button
                    onClick={() => setFilterCategoryId('all')}
                    className={`px-3 py-1.5 rounded-xl border font-medium ${
                      filterCategoryId === 'all'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Tất cả danh mục
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFilterCategoryId(c.id)}
                      className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 ${
                        filterCategoryId === c.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter By Payment Method */}
              <div>
                <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wider text-2xs">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'cash', label: 'Tiền mặt' },
                    { id: 'bank', label: 'Chuyển khoản' },
                    { id: 'e_wallet', label: 'Ví điện tử' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFilterPayment(p.id)}
                      className={`py-2 rounded-xl border text-center font-semibold ${
                        filterPayment === p.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={resetAllFilters}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerTab;
