import React from 'react';
import { Cloud, CloudCheck, LogIn, LogOut, ShieldCheck, RefreshCw } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const CloudSyncBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { currentUser, loginWithGoogle, logoutGoogle, isAuthLoading, isCloudSyncing } =
    useFinance();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-2 text-2xs text-slate-400">
        <RefreshCw size={12} className="animate-spin mr-1.5" />
        <span>Đang kiểm tra kết nối đám mây...</span>
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'Avatar'}
              className="w-7 h-7 rounded-full border border-emerald-400 object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.displayName ? currentUser.displayName[0] : 'U'}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-2xs font-bold text-slate-800 truncate">
                {currentUser.displayName || currentUser.email}
              </p>
            </div>
            <p className="text-3xs text-emerald-600 font-medium flex items-center gap-0.5">
              <span>Đã đồng bộ đám mây Cloud</span>
              {isCloudSyncing && <RefreshCw size={9} className="animate-spin ml-0.5" />}
            </p>
          </div>
        </div>

        <button
          onClick={logoutGoogle}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition shrink-0"
          title="Đăng xuất tài khoản"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Cloud size={16} />
        </div>
        <div className="min-w-0">
          <h4 className="text-2xs font-bold text-slate-900 leading-tight">
            Lưu dữ liệu vĩnh viễn trên Đám mây
          </h4>
          <p className="text-3xs text-slate-500 mt-0.5 leading-tight">
            An toàn 100%, không lo mất khi xóa cache hay đổi máy
          </p>
        </div>
      </div>

      <button
        onClick={loginWithGoogle}
        disabled={isCloudSyncing}
        className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300/80 px-2.5 py-1.5 rounded-xl font-bold text-2xs shadow-2xs transition active:scale-95 shrink-0"
      >
        {/* Google G logo */}
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Đăng nhập</span>
      </button>
    </div>
  );
};

export default CloudSyncBar;
