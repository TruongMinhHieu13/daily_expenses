import React, { useMemo, useState } from 'react';
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  Plus,
  CalendarDays,
  BarChart3,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatVND, formatDateVN, getTodayString } from '../utils/formatters';
import { MonthSelector } from './MonthSelector';
import { CategoryIcon } from './CategoryIcon';
import { FinancialCalendar } from './FinancialCalendar';
import { CloudSyncBar } from './CloudSyncBar';
import { ReloadButton } from './ReloadButton';
import { Transaction } from '../types/finance';

interface DashboardTabProps {
  onOpenAddModal: () => void;
  onOpenAddModalWithDate: (dateStr: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onNavigateToLedger: () => void;
  onNavigateToAnalytics: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onOpenAddModal,
  onOpenAddModalWithDate,
  onEditTransaction,
  onNavigateToLedger,
  onNavigateToAnalytics,
}) => {
  const {
    transactions,
    categories,
    selectedMonth,
    settings,
    toggleHideBalance,
    currentMonthSummary,
    overallBalance,
  } = useFinance();

  // Switch between Calendar view (default) and Bar Chart view
  const [activityView, setActivityView] = useState<'calendar' | 'chart'>('calendar');

  // Filter transactions for the selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Top 5 recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (b.time || '').localeCompare(a.time || '');
      })
      .slice(0, 5);
  }, [transactions]);

  // Today's total spending
  const todayStr = getTodayString();
  const todayExpense = useMemo(() => {
    return transactions
      .filter((t) => t.date === todayStr && t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions, todayStr]);

  // 7-day mini chart data
  const last7DaysData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = i === 0 ? 'Nay' : i === 1 ? 'Qua' : `T${d.getDay() === 0 ? 'CN' : d.getDay() + 1}`;

      const dayTxs = transactions.filter((t) => t.date === dateStr);
      const income = dayTxs.filter((t) => t.type === 'income').reduce((s, c) => s + c.amount, 0);
      const expense = dayTxs.filter((t) => t.type === 'expense').reduce((s, c) => s + c.amount, 0);

      days.push({
        dateStr,
        dayLabel,
        income,
        expense,
      });
    }
    const maxVal = Math.max(...days.map((d) => Math.max(d.income, d.expense)), 100000);
    return { days, maxVal };
  }, [transactions]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof categories)[0]>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Budget progress percentage
  const budgetPercent = settings.monthlyBudget > 0
    ? Math.min(100, Math.round((currentMonthSummary.totalExpense / settings.monthlyBudget) * 100))
    : 0;

  return (
    <div className="pb-24 pt-2 px-4 space-y-3.5">
      {/* Top Bar: Month Switcher, Reload & Privacy Eye */}
      <div className="flex items-center justify-between gap-2">
        <MonthSelector className="flex-1" />
        <ReloadButton />
        <button
          type="button"
          onClick={toggleHideBalance}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-xs active:scale-95 transition"
          aria-label={settings.hideBalance ? 'Hiện số tiền' : 'Ẩn số tiền'}
          title={settings.hideBalance ? 'Hiện số tiền' : 'Ẩn số tiền'}
        >
          {settings.hideBalance ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>

      {/* Cloud Sync Status & Google Login Bar */}
      <CloudSyncBar />

      {/* Hero Fintech Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-5 shadow-xl shadow-emerald-900/15">
        {/* Decorative background glow circles */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-emerald-100/80 text-xs font-medium">
            <span>Tổng số dư tích lũy</span>
            {todayExpense > 0 && (
              <span className="bg-emerald-500/30 px-2 py-0.5 rounded-full text-emerald-100 text-2xs border border-emerald-400/20">
                Hôm nay chi: {settings.hideBalance ? '******' : formatVND(todayExpense)}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-numbers tracking-tight">
              {settings.hideBalance ? '•••••••• ₫' : formatVND(overallBalance)}
            </span>
          </div>

          {/* Monthly Inflow & Outflow pill breakdown */}
          <div className="mt-4 pt-3 border-t border-emerald-500/30 grid grid-cols-2 gap-2.5">
            <div className="bg-emerald-950/30 rounded-2xl p-2.5 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-emerald-300 text-3xs sm:text-2xs font-semibold uppercase tracking-wider">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <TrendingUp size={10} className="text-emerald-300" />
                </div>
                <span>Thu trong tháng</span>
              </div>
              <p className="text-xs sm:text-sm font-bold font-mono-numbers text-emerald-100 mt-1">
                {settings.hideBalance ? '******' : `+${formatVND(currentMonthSummary.totalIncome)}`}
              </p>
            </div>

            <div className="bg-emerald-950/30 rounded-2xl p-2.5 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-rose-300 text-3xs sm:text-2xs font-semibold uppercase tracking-wider">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-400/20 flex items-center justify-center">
                  <TrendingDown size={10} className="text-rose-300" />
                </div>
                <span>Chi trong tháng</span>
              </div>
              <p className="text-xs sm:text-sm font-bold font-mono-numbers text-rose-100 mt-1">
                {settings.hideBalance ? '******' : `-${formatVND(currentMonthSummary.totalExpense)}`}
              </p>
            </div>
          </div>

          {/* Net Remaining in month */}
          <div className="mt-2.5 flex items-center justify-between text-2xs sm:text-xs text-emerald-100/90 bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-xs">
            <span>Dòng tiền tháng {selectedMonth.slice(5)}:</span>
            <span
              className={`font-bold font-mono-numbers ${
                currentMonthSummary.netSavings >= 0 ? 'text-emerald-200' : 'text-rose-200'
              }`}
            >
              {settings.hideBalance
                ? '******'
                : `${currentMonthSummary.netSavings >= 0 ? '+' : ''}${formatVND(
                    currentMonthSummary.netSavings
                  )}`}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Budget Tracker Bar */}
      {settings.monthlyBudget > 0 && (
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700">Tiến độ chi tiêu tháng</span>
            <span className="font-semibold text-slate-500 font-mono-numbers">
              {budgetPercent}% / {settings.hideBalance ? '******' : formatVND(settings.monthlyBudget)}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent > 90
                  ? 'bg-rose-500'
                  : budgetPercent > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          {budgetPercent >= 100 && (
            <p className="text-2xs text-rose-500 font-medium mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              <span>Đã vượt quá hạn mức ngân sách tháng này!</span>
            </p>
          )}
        </div>
      )}

      {/* View Mode Toggle: [Lịch Thu Chi Tháng 📅] vs [Biểu Đồ 7 Ngày 📊] */}
      <div className="flex items-center justify-between px-1">
        <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
          Theo dõi dòng tiền
        </span>
        <div className="flex items-center p-0.5 bg-slate-200/80 rounded-xl text-2xs font-bold">
          <button
            onClick={() => setActivityView('calendar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              activityView === 'calendar'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays size={12} />
            <span>Dạng Lịch</span>
          </button>

          <button
            onClick={() => setActivityView('chart')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              activityView === 'chart'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 size={12} />
            <span>Biểu Đồ</span>
          </button>
        </div>
      </div>

      {/* Primary Section: Financial Calendar View OR 7-Day Chart View */}
      {activityView === 'calendar' ? (
        <FinancialCalendar
          onEditTransaction={onEditTransaction}
          onOpenAddModalWithDate={onOpenAddModalWithDate}
          onSwitchToChart={() => setActivityView('chart')}
          showViewToggle={false}
        />
      ) : (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 size={15} className="text-emerald-600" />
                <span>Biến động thu chi 7 ngày qua</span>
              </h3>
              <p className="text-2xs text-slate-400">So sánh chi tiêu & thu nhập gần đây</p>
            </div>
            <button
              onClick={onNavigateToAnalytics}
              className="text-2xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
            >
              <span>Xem chi tiết</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Mini SVG Bar Chart */}
          <div className="flex items-end justify-between gap-1 pt-3 h-28 border-b border-slate-100 pb-1">
            {last7DaysData.days.map((d) => {
              const expenseH = Math.max(4, Math.round((d.expense / last7DaysData.maxVal) * 80));
              const incomeH = Math.max(4, Math.round((d.income / last7DaysData.maxVal) * 80));

              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1">
                  {/* Dual bars: green income, red expense */}
                  <div className="flex items-end justify-center gap-1 h-20 w-full">
                    {/* Income bar */}
                    <div
                      className="w-2.5 bg-emerald-400 rounded-t-md transition-all duration-300"
                      style={{ height: d.income > 0 ? `${incomeH}px` : '3px' }}
                      title={`Thu: ${formatVND(d.income)}`}
                    />
                    {/* Expense bar */}
                    <div
                      className="w-2.5 bg-rose-400 rounded-t-md transition-all duration-300"
                      style={{ height: d.expense > 0 ? `${expenseH}px` : '3px' }}
                      title={`Chi: ${formatVND(d.expense)}`}
                    />
                  </div>
                  <span className="text-2xs font-semibold text-slate-500 mt-1">{d.dayLabel}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Khoản Thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Khoản Chi</span>
              </div>
            </div>

            <button
              onClick={() => setActivityView('calendar')}
              className="text-emerald-600 font-bold hover:underline text-2xs"
            >
              Xem dạng lịch 📅
            </button>
          </div>
        </div>
      )}

      {/* Recent 5 Transactions Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} className="text-emerald-600" />
            <span>5 Giao dịch gần nhất</span>
          </h3>
          <button
            onClick={onNavigateToLedger}
            className="text-2xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>Xem tất cả ({transactions.length})</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Sparkles size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-800">Chưa có giao dịch nào</p>
            <p className="text-xs text-slate-400 mt-1">Bấm nút + bên dưới để ghi chép khoản chi đầu tiên</p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus size={16} />
              <span>Ghi chép ngay</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl divide-y divide-slate-100 border border-slate-200/80 shadow-xs overflow-hidden">
            {recentTransactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 active:bg-slate-100/80 transition cursor-pointer"
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
                        <span>•</span>
                        <span>{formatDateVN(tx.date)}</span>
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
                    <span className="text-3xs text-slate-400">{tx.time || ''}</span>
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

export default DashboardTab;
