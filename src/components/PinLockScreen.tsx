import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck, AlertCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const PinLockScreen: React.FC = () => {
  const { verifyPin } = useFinance();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorAnimation, setErrorAnimation] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (pinInput.length >= 4) return;
    const newPin = pinInput + num;
    setPinInput(newPin);
    setErrorMessage('');

    if (newPin.length === 4) {
      setTimeout(() => {
        const isValid = verifyPin(newPin);
        if (!isValid) {
          setErrorAnimation(true);
          setErrorMessage('Mã PIN không chính xác, vui lòng thử lại');
          setTimeout(() => {
            setPinInput('');
            setErrorAnimation(false);
          }, 600);
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    if (pinInput.length > 0) {
      setPinInput((prev) => prev.slice(0, -1));
      setErrorMessage('');
    }
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-900 text-white px-6 py-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col items-center mt-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <Lock size={30} strokeWidth={2.2} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Sổ Thu Chi</h1>
        <p className="text-sm text-slate-400 mt-1">Bảo vệ quyền riêng tư tài chính</p>
      </div>

      {/* PIN Dots Display */}
      <div className="flex flex-col items-center my-6">
        <p className="text-xs font-medium text-slate-300 mb-6 uppercase tracking-wider">
          Nhập mã PIN 4 chữ số
        </p>

        <div className={`flex items-center gap-5 ${errorAnimation ? 'animate-bounce text-rose-400' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-125 shadow-md shadow-emerald-400/50'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {errorMessage && (
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium mt-4">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(String(num))}
            className="h-16 rounded-2xl bg-slate-800/80 active:bg-emerald-600/40 border border-slate-700/60 text-2xl font-semibold text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm"
          >
            {num}
          </button>
        ))}

        <button
          onClick={handleClear}
          className="h-16 rounded-2xl bg-slate-800/40 text-sm font-medium text-slate-400 flex items-center justify-center active:bg-slate-700/60 active:scale-95 transition-all"
        >
          Xóa
        </button>

        <button
          onClick={() => handleKeyPress('0')}
          className="h-16 rounded-2xl bg-slate-800/80 active:bg-emerald-600/40 border border-slate-700/60 text-2xl font-semibold text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="h-16 rounded-2xl bg-slate-800/40 active:bg-slate-700/60 text-slate-300 flex items-center justify-center active:scale-95 transition-all"
          aria-label="Xóa 1 số"
        >
          <Delete size={22} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>Dữ liệu được lưu trữ an toàn cục bộ trên máy của bạn</span>
      </div>
    </div>
  );
};

export default PinLockScreen;
