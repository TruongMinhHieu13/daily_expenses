import React, { useState } from 'react';
import { Download, Share2, PlusSquare, Check, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
        <Check size={14} className="text-emerald-600" />
        <span>Ứng dụng đã cài đặt trên thiết bị</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center justify-center gap-2 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-medium shadow-sm shadow-emerald-600/30 transition-all active:scale-95 ${
          compact ? 'px-3 py-1.5 text-xs' : 'w-full py-2.5 text-sm'
        }`}
      >
        <Download size={compact ? 14 : 16} />
        <span>Cài đặt ứng dụng (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium transition-all active:scale-95 ${
            compact ? 'px-3 py-1.5 text-xs' : 'w-full py-2.5 text-sm'
          }`}
        >
          <Download size={compact ? 14 : 16} />
          <span>Thêm vào màn hình chính iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Download size={18} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Cài đặt trên iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Nhấn vào biểu tượng <strong className="text-slate-900 font-semibold inline-flex items-center gap-1"><Share2 size={14} className="inline text-blue-500" /> Chia sẻ (Share)</strong> ở thanh công cụ dưới cùng của trình duyệt Safari.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Cuộn xuống và chọn <strong className="text-slate-900 font-semibold inline-flex items-center gap-1"><PlusSquare size={14} className="inline text-emerald-600" /> Thêm vào MH chính (Add to Home Screen)</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Nhấn nút <strong className="text-slate-900 font-semibold">Thêm (Add)</strong> ở góc trên bên phải để hoàn tất.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 active:scale-98 transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback info button if not directly triggered yet
  return (
    <button
      onClick={() => {
        alert('Để cài đặt ứng dụng: hãy mở menu cài đặt của trình duyệt và chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".');
      }}
      className={`flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-all ${
        compact ? 'px-3 py-1.5 text-xs' : 'w-full py-2.5 text-sm'
      }`}
    >
      <Download size={compact ? 14 : 16} />
      <span>Cài đặt ứng dụng</span>
    </button>
  );
};

export default PWAInstallButton;
