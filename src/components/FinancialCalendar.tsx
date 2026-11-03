import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  TrendingDown,
  TrendingUp,
  Plus,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  formatVND,
  formatCompactVND,
  formatFullDateVN,
  getTodayString,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Transaction } from '../types/finance';

interface FinancialCalendarProps {
  onEditTransaction: (tx: Transaction) => void;
  onOpenAddModalWithDate: (dateStr: string) => void;
  onSwitchToChart?: () => void;
  showViewToggle?: boolean;
}

export const FinancialCalendar: React.FC<FinancialCalendarProps> = ({
  onEditTransaction,
  onOpenAddModalWithDate,
  onSwitchToChart,
  showViewToggle = true,
}) => {
  const { transactions, categories, selectedMonth, settings } = useFinance();

  const todayStr = getTodayString();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (todayStr.startsWith(selectedMonth)) {
      return todayStr;
    }
    return `${selectedMonth}-01`;
  });

  // Category lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof categories)[0]>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Daily map of transactions for the selected month
  const dailyDataMap = useMemo(() => {
    const map = new Map<
      string,
      {
        income: number;
        expense: number;
        transactions: Transaction[];
      }
    >();

    for (const tx of transactions) {
      if (tx.date.startsWith(selectedMonth)) {
        const existing = map.get(tx.date) || { income: 0, expense: 0, transactions: [] };
        if (tx.type === 'income') {
          existing.income += tx.amount;
        } else {
          existing.expense += tx.amount;
        }
        existing.transactions.push(tx);
        map.set(tx.date, existing);
      }
    }

    return map;
  }, [transactions, selectedMonth]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDayDate = new Date(year, month - 1, 1);
    const lastDayDate = new Date(year, month, 0);
    const totalDaysInMonth = lastDayDate.getDate();

    // Monday-based index: Mon = 0, Tue = 1, ..., Sun = 6
    const firstDayOfWeek = (firstDayDate.getDay() + 6) % 7;

    // Previous month overflow days
    const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
    const prevDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      prevDays.push({
        dayNumber: prevMonthLastDate - i,
        isCurrentMonth: false,
        dateStr: '',
        income: 0,
        expense: 0,
        transactions: [],
      });
    }

    // Current month days
    const currentDays = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = dailyDataMap.get(dateStr) || { income: 0, expense: 0, transactions: [] };
      currentDays.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        income: dayData.income,
        expense: dayData.expense,
        transactions: dayData.transactions,
      });
    }

    // Next month overflow days to complete last week
    const totalRendered = prevDays.length + currentDays.length;
    const nextDaysCount = (7 - (totalRendered % 7)) % 7;
    const nextDays = [];
    for (let n = 1; n <= nextDaysCount; n++) {
      nextDays.push({
        dayNumber: n,
        isCurrentMonth: false,
        dateStr: '',
        income: 0,
        expense: 0,
        transactions: [],
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [selectedMonth, dailyDataMap]);

  // Selected Day's details
  const selectedDayData = useMemo(() => {
    return (
      dailyDataMap.get(selectedDate) || {
        income: 0,
        expense: 0,
        transactions: [],
      }
    );
  }, [dailyDataMap, selectedDate]);

  // Compact money format (e.g. -45k, +22tr) as requested
  const getAmountDisplay = (amount: number, isExp: boolean) => {
    const prefix = isExp ? '-' : '+';
    return `${prefix}${formatCompactVND(amount)}`;
  };

  const getAmountFontSize = (text: string) => {
    if (text.length >= 8) return 'text-[7.5px] leading-[9px]';
    return 'text-[8.5px] sm:text-[9px] leading-[10px]';
  };

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-3">
      {/* Calendar Header with View Switcher */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon size={15} className="text-emerald-600" />
            <span>Lịch thu chi tháng {selectedMonth.slice(5)}/{selectedMonth.slice(0, 4)}</span>
          </h3>
          <p className="text-2xs text-slate-400">Xem và chọn ngày để theo dõi chi tiêu và thu nhập</p>
        </div>

        {showViewToggle && onSwitchToChart && (
          <button
            onClick={onSwitchToChart}
            className="flex items-center gap-1 text-2xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl transition active:scale-95"
            title="Chuyển sang biểu đồ 7 ngày"
          >
            <BarChart3 size={13} />
            <span>Biểu đồ</span>
          </button>
        )}
      </div>

      {/* Calendar Grid Container */}
      <div>
        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={`text-2xs font-bold py-0.5 ${
                idx >= 5 ? 'text-rose-500' : 'text-slate-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, idx) => {
            if (!item.isCurrentMonth) {
              return (
                <div
                  key={`empty_${idx}`}
                  className="min-h-[56px] sm:min-h-[60px] rounded-xl p-1 bg-slate-50/40 text-slate-300 flex flex-col justify-between select-none pointer-events-none"
                >
                  <span className="text-3xs font-medium">{item.dayNumber}</span>
                </div>
              );
            }

            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === todayStr;
            const hasExpense = item.expense > 0;
            const hasIncome = item.income > 0;

            const expenseStr = hasExpense ? getAmountDisplay(item.expense, true) : '';
            const incomeStr = hasIncome ? getAmountDisplay(item.income, false) : '';

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => setSelectedDate(item.dateStr)}
                className={`min-h-[56px] sm:min-h-[60px] rounded-xl p-1 flex flex-col justify-between text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-50/95 border-2 border-emerald-500 shadow-xs ring-1 ring-emerald-300 z-10 scale-102'
                    : isToday
                    ? 'bg-slate-50 border border-emerald-400 hover:bg-slate-100'
                    : 'bg-slate-50/80 border border-slate-100 hover:bg-slate-100/90 active:scale-95'
                }`}
              >
                {/* Top Row: Date number & Today dot indicator */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] leading-none font-bold ${
                      isSelected
                        ? 'text-emerald-800 font-extrabold'
                        : isToday
                        ? 'text-emerald-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {item.dayNumber}
                  </span>

                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Hôm nay" />
                  )}
                </div>

                {/* Bottom Row: Money Amounts (compact -45k, +22tr - shows both income & expense) */}
                <div className="flex flex-col w-full overflow-hidden gap-0.5 mt-auto">
                  {/* Expense Amount */}
                  {hasExpense ? (
                    <span
                      className={`${getAmountFontSize(
                        expenseStr
                      )} font-bold font-mono-numbers text-rose-600 block tracking-tighter truncate`}
                      title={`Chi: ${formatVND(item.expense)}`}
                    >
                      {expenseStr}
                    </span>
                  ) : (
                    !hasIncome && (
                      <span className="text-[7.5px] text-slate-300 font-bold block select-none">·</span>
                    )
                  )}

                  {/* Income Amount */}
                  {hasIncome && (
                    <span
                      className={`${getAmountFontSize(
                        incomeStr
                      )} font-bold font-mono-numbers text-emerald-600 block tracking-tighter truncate`}
                      title={`Thu: ${formatVND(item.income)}`}
                    >
                      {incomeStr}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Transaction Breakdown Drawer/Panel */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800">
              {formatFullDateVN(selectedDate)}
            </h4>
          </div>

          <button
            onClick={() => onOpenAddModalWithDate(selectedDate)}
            className="flex items-center gap-1 text-2xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-2.5 py-1 rounded-xl shadow-xs transition"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Thêm vào ngày này</span>
          </button>
        </div>

        {/* Selected Day Subtotals */}
        <div className="flex items-center justify-between text-2xs px-1 text-slate-500 font-semibold font-mono-numbers">
          <div className="flex items-center gap-1 text-rose-600">
            <TrendingDown size={13} />
            <span>Đã chi: -{formatVND(selectedDayData.expense)}</span>
          </div>
          {selectedDayData.income > 0 && (
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp size={13} />
              <span>Đã thu: +{formatVND(selectedDayData.income)}</span>
            </div>
          )}
        </div>

        {/* Transaction list for this date */}
        {selectedDayData.transactions.length === 0 ? (
          <div className="p-3.5 rounded-2xl bg-slate-50 text-center border border-slate-100">
            <p className="text-2xs text-slate-500 font-medium">
              Chưa có giao dịch nào trong ngày này.
            </p>
            <button
              onClick={() => onOpenAddModalWithDate(selectedDate)}
              className="text-2xs font-bold text-emerald-600 hover:underline mt-1 inline-block"
            >
              + Ghi chép cho ngày {selectedDate.slice(8)}/{selectedDate.slice(5, 7)}
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {selectedDayData.transactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 active:bg-slate-200/70 border border-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat?.color || '#10B981' }}
                    >
                      <CategoryIcon iconName={cat?.icon || 'Tag'} size={15} color="#FFFFFF" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {tx.note || cat?.name}
                      </p>
                      <p className="text-3xs text-slate-400">
                        {cat?.name} {tx.time ? `• ${tx.time}` : ''}
                      </p>
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
                    <span className="text-3xs text-slate-400">
                      {tx.paymentMethod === 'cash'
                        ? 'Tiền mặt'
                        : tx.paymentMethod === 'bank'
                        ? 'Chuyển khoản'
                        : 'Ví điện tử'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialCalendar;
