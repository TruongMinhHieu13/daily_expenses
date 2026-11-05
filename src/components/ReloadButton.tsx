import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface ReloadButtonProps {
  className?: string;
  size?: number;
}

export const ReloadButton: React.FC<ReloadButtonProps> = ({
  className = '',
  size = 18,
}) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleReload = () => {
    setIsRotating(true);
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <button
      type="button"
      onClick={handleReload}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-white border border-slate-200/90 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 active:bg-slate-50 shadow-xs active:scale-95 transition ${className}`}
      aria-label="Tải lại trang"
      title="Tải lại trang"
    >
      <RotateCcw
        size={size}
        className={`transition-transform duration-300 ${isRotating ? 'animate-spin text-emerald-600' : ''}`}
      />
    </button>
  );
};

export default ReloadButton;
