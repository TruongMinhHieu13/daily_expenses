import React, { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  X,
  RefreshCw,
  Globe,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AuthErrorInfo } from '../services/firebase';

interface AuthErrorModalProps {
  authError: AuthErrorInfo | null;
  onClose: () => void;
  onRetryPopup: () => void;
  onRetryRedirect: () => void;
}

export const AuthErrorModal: React.FC<AuthErrorModalProps> = ({
  authError,
  onClose,
  onRetryPopup,
  onRetryRedirect,
}) => {
  const [copied, setCopied] = useState(false);

  if (!authError) return null;

  const handleCopy = () => {
    if (authError.domain) {
      navigator.clipboard.writeText(authError.domain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const firebaseConsoleUrl = authError.projectId
    ? `https://console.firebase.google.com/project/${authError.projectId}/authentication/settings`
    : 'https://console.firebase.google.com/';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                {authError.helpType === 'unauthorized-domain'
                  ? 'Cần thêm tên miền vào Firebase'
                  : authError.helpType === 'popup-blocked'
                  ? 'Popup đăng nhập bị chặn'
                  : 'Lỗi đăng nhập Google'}
              </h3>
              <p className="text-3xs text-slate-400 font-mono mt-0.5">
                Mã lỗi: {authError.code}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content based on error type */}
        {authError.helpType === 'unauthorized-domain' ? (
          <div className="space-y-3 text-2xs">
            <p className="text-slate-600 leading-relaxed">
              Google yêu cầu tên miền đang chạy ứng dụng phải được cấp phép trong Firebase Auth để ngăn chặn giả mạo:
            </p>

            {/* Domain Box with One-tap Copy */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5">
              <span className="block text-3xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Globe size={11} className="text-emerald-600" />
                <span>Tên miền hiện tại cần thêm:</span>
              </span>
              <div className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span className="font-mono text-2xs font-bold text-slate-800 break-all select-all">
                  {authError.domain || window.location.hostname}
                </span>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 text-3xs font-bold px-2 py-1 rounded-lg transition shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>

            {/* Quick 3-Step Guide */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-slate-700 space-y-2 text-2xs">
              <p className="font-bold text-emerald-900 text-2xs uppercase tracking-wider flex items-center gap-1">
                <span>Cách khắc phục (chỉ 30 giây):</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>
                  Bấm nút <strong>Mở Firebase Settings</strong> bên dưới.
                </li>
                <li>
                  Tìm mục <strong>Authorized domains</strong> và bấm <strong>Add domain</strong>.
                </li>
                <li>
                  Dán tên miền vừa sao chép ở trên vào và bấm <strong>Add</strong>.
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <a
                href={firebaseConsoleUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                <span>Mở Firebase Settings</span>
                <ExternalLink size={14} />
              </a>

              <button
                onClick={onRetryPopup}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <RefreshCw size={13} />
                <span>Thử đăng nhập lại</span>
              </button>
            </div>
          </div>
        ) : authError.helpType === 'popup-blocked' ? (
          <div className="space-y-3 text-2xs">
            <p className="text-slate-600 leading-relaxed">
              Trình duyệt (hoặc thiết bị di động) đã chặn mở cửa sổ mới (Popup). Bạn có thể đăng nhập bằng chế độ <strong>Chuyển hướng trang (Redirect)</strong>.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={onRetryRedirect}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                <span>Đăng nhập chuyển hướng (Redirect)</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={onRetryPopup}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <RefreshCw size={13} />
                <span>Thử lại với Popup</span>
              </button>
            </div>
          </div>
        ) : authError.helpType === 'popup-closed' ? (
          <div className="space-y-3 text-2xs">
            <p className="text-slate-600 leading-relaxed">
              Cửa sổ đăng nhập Google đã bị đóng trước khi quá trình hoàn tất.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onClose}
                className="py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Đóng
              </button>
              <button
                onClick={onRetryPopup}
                className="py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-2xs">
            <p className="text-slate-600 leading-relaxed">
              {authError.message || 'Không thể kết nối đến tài khoản Google lúc này. Vui lòng thử lại sau.'}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onClose}
                className="py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Đóng
              </button>
              <button
                onClick={onRetryPopup}
                className="py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
