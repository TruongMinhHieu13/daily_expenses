import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Calendar,
  Wallet,
  CreditCard,
  Smartphone,
  Trash2,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Category, PaymentMethod, Transaction, TransactionType } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';
import { formatVND, getTodayString, getCurrentTimeString } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
  defaultDate?: string;
}

const QUICK_AMOUNTS = [
  { label: '+20k', value: 20000 },
  { label: '+50k', value: 50000 },
  { label: '+100k', value: 100000 },
  { label: '+200k', value: 200000 },
  { label: '+500k', value: 500000 },
  { label: '+1Tr', value: 1000000 },
  { label: '+2Tr', value: 2000000 },
  { label: '+5Tr', value: 5000000 },
];

const EXPENSE_QUICK_NOTES = [
  'Ăn trưa',
  'Cà phê',
  'Đổ xăng',
  'Đi siêu thị',
  'Ăn tối',
  'Tiền điện nước',
  'Tiền nhà',
  'Trà sữa',
];

const INCOME_QUICK_NOTES = [
  'Lương tháng',
  'Thưởng công việc',
  'Làm thêm',
  'Bán hàng',
  'Hoàn tiền',
  'Lãi tiết kiệm',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTransaction,
  defaultDate,
}) => {
  const { categories, addTransaction, updateTransaction, deleteTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDate || getTodayString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Filter categories matching current transaction type
  const availableCategories = categories.filter((c) => c.type === type);

  // Initialize or reset form state
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmountStr(String(editTransaction.amount));
      setCategoryId(editTransaction.categoryId);
      setNote(editTransaction.note || '');
      setDate(editTransaction.date);
      setTime(editTransaction.time || getCurrentTimeString());
      setPaymentMethod(editTransaction.paymentMethod || 'cash');
    } else {
      setType('expense');
      setAmountStr('');
      setNote('');
      setDate(defaultDate || getTodayString());
      setTime(getCurrentTimeString());
      setPaymentMethod('cash');
      // Default to first category
      const firstCat = categories.find((c) => c.type === 'expense');
      if (firstCat) setCategoryId(firstCat.id);
    }
    setShowConfirmDelete(false);
    setErrorMsg('');
  }, [editTransaction, isOpen, categories]);

  // When type changes, ensure valid category selection
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstMatching = categories.find((c) => c.type === newType);
    if (firstMatching) {
      setCategoryId(firstMatching.id);
    }
  };

  // Quick increment amounts
  const handleAddQuickAmount = (val: number) => {
    const current = parseInt(amountStr.replace(/[^\d]/g, ''), 10) || 0;
    const nextVal = current + val;
    setAmountStr(String(nextVal));
    setErrorMsg('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setAmountStr(raw);
    setErrorMsg('');
  };

  const currentNumericAmount = parseInt(amountStr.replace(/[^\d]/g, ''), 10) || 0;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!currentNumericAmount || currentNumericAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền hợp lệ (> 0 đ)');
      return;
    }

    if (!categoryId) {
      setErrorMsg('Vui lòng chọn một danh mục');
      return;
    }

    // Default note if left empty
    const selectedCat = categories.find((c) => c.id === categoryId);
    const finalNote = note.trim() || selectedCat?.name || (type === 'expense' ? 'Khoản chi' : 'Khoản thu');

    if (editTransaction) {
      updateTransaction(editTransaction.id, {
        type,
        amount: currentNumericAmount,
        categoryId,
        note: finalNote,
        date,
        time,
        paymentMethod,
      });
    } else {
      addTransaction({
        type,
        amount: currentNumericAmount,
        categoryId,
        note: finalNote,
        date,
        time,
        paymentMethod,
      });
    }

    // Gentle tactile feedback if browser supports it
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch (err) {
        // ignore
      }
    }

    onClose();
  };

  const handleDelete = () => {
    if (editTransaction) {
      deleteTransaction(editTransaction.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        style={{ paddingBottom: 'calc(var(--sab) + 12px)' }}
      >
        {/* Modal Handle & Header */}
        <div className="pt-3 px-5 pb-2 shrink-0 border-b border-slate-100">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              {editTransaction ? 'Chỉnh sửa giao dịch' : 'Ghi chép giao dịch'}
            </h2>
            <div className="flex items-center gap-1">
              {editTransaction && (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                  aria-label="Xóa giao dịch"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Segmented Type Switcher: Chi vs Thu */}
          <div className="grid grid-cols-2 p-1 mt-3 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khoản Chi (Tiền ra)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khoản Thu (Tiền vào)
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 text-slate-800">
          {/* Big Amount Input Field */}
          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
              <span>Số tiền ({type === 'expense' ? 'Chi' : 'Thu'})</span>
              <span className="font-semibold text-slate-700">Đơn vị: VNĐ</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl sm:text-2xl font-extrabold ${type === 'expense' ? 'text-rose-500' : 'text-emerald-600'}`}>
                {type === 'expense' ? '-' : '+'}
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus={!editTransaction}
                placeholder="0"
                value={currentNumericAmount ? formatVND(currentNumericAmount, false) : ''}
                onChange={handleAmountChange}
                className="w-full bg-transparent text-xl sm:text-2xl font-bold font-mono-numbers text-slate-900 outline-none placeholder:text-slate-300"
              />
              <span className="text-base sm:text-lg font-bold text-slate-500">₫</span>
            </div>

            {/* Quick preset amount chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleAddQuickAmount(q.value)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 text-xs font-semibold shrink-0 transition active:scale-95 shadow-2xs"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 font-semibold px-1">{errorMsg}</p>
          )}

          {/* Category Picker Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chọn danh mục {type === 'expense' ? 'chi' : 'thu'}
              </span>
              <span className="text-2xs text-slate-400">
                {availableCategories.length} danh mục
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 rounded-2xl bg-slate-50/50 border border-slate-100">
              {availableCategories.map((cat) => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(cat.id);
                      setErrorMsg('');
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                      isSelected
                        ? 'bg-white shadow-md ring-2 ring-emerald-500 scale-102'
                        : 'hover:bg-white/80 active:scale-95'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-1 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} size={20} color="#FFFFFF" />
                    </div>
                    <span
                      className={`text-2xs font-semibold truncate w-full text-center ${
                        isSelected ? 'text-slate-900 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note & Quick Tag Suggestions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Nội dung ghi chú
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập ghi chú (VD: Cơm trưa, Cà phê...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Quick note chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
              {(type === 'expense' ? EXPENSE_QUICK_NOTES : INCOME_QUICK_NOTES).map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setNote(quick)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-2xs font-medium shrink-0 transition"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>

          {/* Date, Time & Payment Method in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={13} className="text-slate-500" />
                <span>Ngày giao dịch</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800 border border-slate-200 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Clock size={13} className="text-slate-500" />
                <span>Giờ</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800 border border-slate-200 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Phương thức thanh toán
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wallet size={15} />
                <span>Tiền mặt</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                  paymentMethod === 'bank'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard size={15} />
                <span>Chuyển khoản</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('e_wallet')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                  paymentMethod === 'e_wallet'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone size={15} />
                <span>Ví điện tử</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Save Action Button */}
        <div className="p-4 pt-2 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={() => handleSubmit()}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
              type === 'expense'
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
            }`}
          >
            <Check size={18} strokeWidth={2.5} />
            <span>{editTransaction ? 'Lưu Thay Đổi' : 'Xác Nhận Lưu Giao Dịch'}</span>
          </button>
        </div>

        {/* Delete Confirmation Dialog */}
        {showConfirmDelete && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="w-full bg-white rounded-3xl p-5 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác nhận xóa giao dịch?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hành động này sẽ xóa vĩnh viễn giao dịch này khỏi sổ thu chi của bạn.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 shadow-sm shadow-rose-500/30"
                >
                  Xóa ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;
