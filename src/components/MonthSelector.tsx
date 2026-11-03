import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatMonthFullVN, getCurrentMonthString } from '../utils/formatters';

export const MonthSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { selectedMonth, setSelectedMonth } = useFinance();
  const [showPicker, setShowPicker] = useState(false);

  const currentMonthStr = getCurrentMonthString();

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    setSelectedMonth(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setSelectedMonth(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  // Generate recent 12 months for picker modal
  const getRecentMonths = () => {
    const months = [];
    const [currYear] = currentMonthStr.split('-').map(Number);
    for (let y = currYear; y >= currYear - 1; y--) {
      for (let m = 12; m >= 1; m--) {
        months.push(`${y}-${String(m).padStart(2, '0')}`);
      }
    }
    return months.slice(0, 16);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-600 transition"
          aria-label="Tháng trước"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-slate-800 font-bold text-sm tracking-tight hover:bg-slate-100 transition active:scale-98"
        >
          <Calendar size={15} className="text-emerald-600" />
          <span>{formatMonthFullVN(selectedMonth)}</span>
        </button>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-600 transition"
          aria-label="Tháng sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Month dropdown modal */}
      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute top-12 left-0 right-0 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Chọn tháng thống kê
              </span>
              {selectedMonth !== currentMonthStr && (
                <button
                  onClick={() => {
                    setSelectedMonth(currentMonthStr);
                    setShowPicker(false);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md"
                >
                  Về tháng hiện tại
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto">
              {getRecentMonths().map((m) => {
                const isSelected = m === selectedMonth;
                const isCurrent = m === currentMonthStr;
                const [y, mon] = m.split('-');

                return (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setShowPicker(false);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-medium text-center transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : isCurrent
                        ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    T{parseInt(mon, 10)}/{y}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthSelector;
