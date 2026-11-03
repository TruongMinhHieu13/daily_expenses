import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Share2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatVND, formatMonthFullVN } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { MonthSelector } from './MonthSelector';

export const AnalyticsTab: React.FC = () => {
  const { transactions, categories, selectedMonth, settings } = useFinance();

  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [reportType, setReportType] = useState<'expense' | 'income'>('expense');

  // Month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Previous month transactions for Month-over-Month comparison
  const prevMonthString = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    let prevY = y;
    let prevM = m - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    return `${prevY}-${String(prevM).padStart(2, '0')}`;
  }, [selectedMonth]);

  const prevMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(prevMonthString));
  }, [transactions, prevMonthString]);

  // Totals
  const { currentIncome, currentExpense, currentNet } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const t of monthTransactions) {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    }
    return {
      currentIncome: inc,
      currentExpense: exp,
      currentNet: inc - exp,
    };
  }, [monthTransactions]);

  const { prevIncome, prevExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const t of prevMonthTransactions) {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    }
    return { prevIncome: inc, prevExpense: exp };
  }, [prevMonthTransactions]);

  // MoM Expense difference %
  const momExpenseDiffPercent = useMemo(() => {
    if (prevExpense === 0) return 0;
    return Math.round(((currentExpense - prevExpense) / prevExpense) * 100);
  }, [currentExpense, prevExpense]);

  // Savings rate
  const savingsRate = useMemo(() => {
    if (currentIncome === 0) return 0;
    return Math.max(0, Math.round((currentNet / currentIncome) * 100));
  }, [currentIncome, currentNet]);

  // Category breakdown for current report type
  const categoryBreakdown = useMemo(() => {
    const catMap = new Map<string, number>();
    for (const t of monthTransactions) {
      if (t.type === reportType) {
        catMap.set(t.categoryId, (catMap.get(t.categoryId) || 0) + t.amount);
      }
    }

    const total = reportType === 'expense' ? currentExpense : currentIncome;
    const list: {
      category: (typeof categories)[0];
      amount: number;
      percent: number;
    }[] = [];

    catMap.forEach((amount, catId) => {
      const cat = categories.find((c) => c.id === catId) || {
        id: catId,
        name: 'Chưa phân loại',
        type: reportType,
        icon: 'Tag',
        color: '#94A3B8',
      };
      const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
      list.push({ category: cat, amount, percent });
    });

    list.sort((a, b) => b.amount - a.amount);
    return { list, total };
  }, [monthTransactions, reportType, currentExpense, currentIncome, categories]);

  // Highest spending category
  const topExpenseCategory = useMemo(() => {
    if (reportType === 'expense' && categoryBreakdown.list.length > 0) {
      return categoryBreakdown.list[0];
    }
    return null;
  }, [categoryBreakdown, reportType]);

  // Daily spending curve points over the month (1 to 28/30/31)
  const dailySpendingPoints = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const dailyMap = new Map<number, number>();

    for (let day = 1; day <= daysInMonth; day++) {
      dailyMap.set(day, 0);
    }

    for (const t of monthTransactions) {
      if (t.type === 'expense') {
        const day = parseInt(t.date.slice(8, 10), 10);
        dailyMap.set(day, (dailyMap.get(day) || 0) + t.amount);
      }
    }

    const points = [];
    let max = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const val = dailyMap.get(day) || 0;
      if (val > max) max = val;
      points.push({ day, val });
    }

    return { points, maxVal: Math.max(max, 50000) };
  }, [monthTransactions, selectedMonth]);

  // Donut SVG path calculations
  const donutSegments = useMemo(() => {
    const list = categoryBreakdown.list;
    const total = categoryBreakdown.total;
    if (total === 0 || list.length === 0) return [];

    let accumulatedAngle = 0;
    const radius = 64;
    const center = 80;

    return list.map((item, idx) => {
      const sliceAngle = (item.amount / total) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle = endAngle;

      // Arc coordinates
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;

      // Inner cutout arc
      const innerRadius = 44;
      const ix1 = center + innerRadius * Math.cos(endRad);
      const iy1 = center + innerRadius * Math.sin(endRad);
      const ix2 = center + innerRadius * Math.cos(startRad);
      const iy2 = center + innerRadius * Math.sin(startRad);

      const pathData =
        list.length === 1
          ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.001} ${center - radius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius} Z`
          : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2} Z`;

      return {
        ...item,
        pathData,
        color: item.category.color,
        index: idx,
      };
    });
  }, [categoryBreakdown]);

  // Export report as CSV
  const handleExportCSV = () => {
    let csv = '\uFEFFNgày,Giờ,Loại,Danh mục,Ghi chú,Số tiền (VNĐ),Phương thức\n';
    for (const t of monthTransactions) {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || '';
      const typeLabel = t.type === 'income' ? 'Thu' : 'Chi';
      const payLabel =
        t.paymentMethod === 'cash'
          ? 'Tiền mặt'
          : t.paymentMethod === 'bank'
          ? 'Chuyển khoản'
          : 'Ví điện tử';
      csv += `"${t.date}","${t.time || ''}","${typeLabel}","${cat}","${(t.note || '').replace(/"/g, '""')}","${t.amount}","${payLabel}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BaoCao_ThuChi_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-24 pt-3 px-4 space-y-4">
      {/* Month Selector */}
      <MonthSelector />

      {/* Top Summary Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Tổng quan tài chính {formatMonthFullVN(selectedMonth)}</span>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 text-2xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl"
            title="Xuất file Excel/CSV"
          >
            <Download size={13} />
            <span>Xuất CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-100">
            <span className="text-2xs font-semibold text-emerald-700 uppercase tracking-wider">
              Tổng thu vào
            </span>
            <p className="text-base font-bold font-mono-numbers text-emerald-700 mt-0.5">
              {settings.hideBalance ? '******' : `+${formatVND(currentIncome)}`}
            </p>
          </div>

          <div className="bg-rose-50/70 rounded-2xl p-3 border border-rose-100">
            <span className="text-2xs font-semibold text-rose-700 uppercase tracking-wider">
              Tổng chi ra
            </span>
            <p className="text-base font-bold font-mono-numbers text-rose-700 mt-0.5">
              {settings.hideBalance ? '******' : `-${formatVND(currentExpense)}`}
            </p>
          </div>
        </div>

        {/* Savings Rate & Net Inflow */}
        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3 text-xs border border-slate-100">
          <div>
            <span className="text-2xs text-slate-500 font-medium">Tích lũy còn lại:</span>
            <p
              className={`font-bold font-mono-numbers ${
                currentNet >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {settings.hideBalance
                ? '******'
                : `${currentNet >= 0 ? '+' : ''}${formatVND(currentNet)}`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xs text-slate-500 font-medium">Tỷ lệ tiết kiệm:</span>
            <p className="font-bold text-slate-800 font-mono-numbers">{savingsRate}%</p>
          </div>
        </div>

        {/* MoM Comparison with previous month */}
        <div className="flex items-center gap-2 text-2xs text-slate-500 pt-1">
          {momExpenseDiffPercent > 0 ? (
            <div className="flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
              <ArrowUpRight size={13} />
              <span>Chi tiêu tăng {momExpenseDiffPercent}% so với tháng trước</span>
            </div>
          ) : momExpenseDiffPercent < 0 ? (
            <div className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              <ArrowDownRight size={13} />
              <span>Chi tiêu giảm {Math.abs(momExpenseDiffPercent)}% so với tháng trước</span>
            </div>
          ) : (
            <span>Chi tiêu tương đương với tháng trước</span>
          )}
        </div>
      </div>

      {/* Category Breakdown Donut Section */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        {/* Toggle between Chi tiêu and Thu nhập */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <PieIcon size={14} className="text-emerald-600" />
            <span>Tỷ trọng theo danh mục</span>
          </h3>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-2xs font-bold">
            <button
              onClick={() => {
                setReportType('expense');
                setActiveSegmentIndex(null);
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                reportType === 'expense'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Khoản Chi
            </button>
            <button
              onClick={() => {
                setReportType('income');
                setActiveSegmentIndex(null);
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                reportType === 'income'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Khoản Thu
            </button>
          </div>
        </div>

        {categoryBreakdown.list.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có dữ liệu {reportType === 'expense' ? 'chi tiêu' : 'thu nhập'} trong tháng này.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Donut Chart Visual */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                  {donutSegments.map((seg) => (
                    <path
                      key={seg.category.id}
                      d={seg.pathData}
                      fill={seg.color}
                      opacity={activeSegmentIndex === null || activeSegmentIndex === seg.index ? 1 : 0.4}
                      className="transition-all duration-200 cursor-pointer hover:opacity-90"
                      onClick={() =>
                        setActiveSegmentIndex(
                          activeSegmentIndex === seg.index ? null : seg.index
                        )
                      }
                    />
                  ))}
                </svg>

                {/* Center Label in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-3xs text-slate-400 uppercase font-semibold">
                    {activeSegmentIndex !== null
                      ? donutSegments[activeSegmentIndex]?.category.name
                      : `Tổng ${reportType === 'expense' ? 'Chi' : 'Thu'}`}
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono-numbers">
                    {settings.hideBalance
                      ? '******'
                      : formatVND(
                          activeSegmentIndex !== null
                            ? donutSegments[activeSegmentIndex]?.amount || 0
                            : categoryBreakdown.total
                        )}
                  </span>
                  {activeSegmentIndex !== null && (
                    <span className="text-3xs font-bold text-emerald-600">
                      {donutSegments[activeSegmentIndex]?.percent}%
                    </span>
                  )}
                </div>
              </div>

              <span className="text-3xs text-slate-400 mt-1">
                Chạm vào các phần biểu đồ để xem chi tiết
              </span>
            </div>

            {/* Top Category Callout (if expense) */}
            {topExpenseCategory && reportType === 'expense' && (
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Award size={18} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-amber-900">Chi nhiều nhất: </span>
                  <strong className="text-amber-950 font-extrabold">{topExpenseCategory.category.name}</strong>
                  <span className="text-amber-800">
                    {' '}(chiếm {topExpenseCategory.percent}% tổng chi tiêu).
                  </span>
                  <p className="text-2xs text-amber-700 mt-0.5">
                    Gợi ý: Theo dõi sát sao danh mục này để tối ưu hóa ngân sách tiết kiệm cho tháng tiếp theo.
                  </p>
                </div>
              </div>
            )}

            {/* Category Percent List */}
            <div className="space-y-2 pt-1">
              {categoryBreakdown.list.map((item, idx) => {
                const isSelected = activeSegmentIndex === idx;
                return (
                  <div
                    key={item.category.id}
                    onClick={() =>
                      setActiveSegmentIndex(activeSegmentIndex === idx ? null : idx)
                    }
                    className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50 border-emerald-500 shadow-2xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: item.category.color }}
                        >
                          <CategoryIcon
                            iconName={item.category.icon}
                            size={14}
                            color="#FFFFFF"
                          />
                        </div>
                        <span className="font-semibold text-slate-800">
                          {item.category.name}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-bold font-mono-numbers text-slate-900">
                          {settings.hideBalance ? '******' : formatVND(item.amount)}
                        </span>
                        <span className="text-2xs text-slate-400 font-semibold ml-2">
                          ({item.percent}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.category.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Daily Spending Trend Section */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Biến động chi tiêu từng ngày
          </h3>
          <p className="text-2xs text-slate-400">Các ngày chi tiêu cao điểm trong tháng</p>
        </div>

        {dailySpendingPoints.points.every((p) => p.val === 0) ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Chưa có giao dịch chi tiêu trong tháng này.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-1 h-28 pt-2 border-b border-slate-100 pb-1">
              {dailySpendingPoints.points.map((p) => {
                const heightPercent = Math.max(
                  4,
                  Math.round((p.val / dailySpendingPoints.maxVal) * 90)
                );
                const isHigh = p.val > dailySpendingPoints.maxVal * 0.7;

                return (
                  <div
                    key={p.day}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  >
                    {/* Tooltip on hover/active */}
                    {p.val > 0 && (
                      <div className="absolute -top-7 hidden group-hover:block bg-slate-900 text-white text-3xs font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap z-20 pointer-events-none">
                        {p.day}: {formatVND(p.val)}
                      </div>
                    )}
                    <div
                      className={`w-full max-w-[8px] rounded-t-sm transition-all duration-200 ${
                        isHigh ? 'bg-rose-500' : p.val > 0 ? 'bg-emerald-500' : 'bg-slate-100'
                      }`}
                      style={{ height: `${heightPercent}px` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-3xs text-slate-400 px-1 font-semibold">
              <span>Ngày 1</span>
              <span>Ngày 15</span>
              <span>Cuối tháng</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
