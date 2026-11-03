import React from 'react';
import { LayoutDashboard, BookOpen, PieChart, Settings, Plus } from 'lucide-react';

export type TabType = 'dashboard' | 'ledger' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'ledger' as TabType, label: 'Nhật ký', icon: BookOpen },
    { id: 'analytics' as TabType, label: 'Thống kê', icon: PieChart },
    { id: 'settings' as TabType, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div
        className="w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pointer-events-auto"
        style={{ paddingBottom: 'calc(var(--sab) + 6px)' }}
      >
        <div className="relative flex items-center justify-around h-14 px-2">
          {/* First two tabs */}
          {tabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-emerald-600 scale-102' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-emerald-50' : ''}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Central Floating Elevated Quick-Add Button */}
          <div className="flex-1 flex items-center justify-center -mt-5">
            <button
              onClick={onOpenAddModal}
              className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 border-[3.5px] border-white active:scale-92 transition-transform duration-150"
              aria-label="Thêm giao dịch mới"
            >
              <Plus size={22} strokeWidth={2.8} />
            </button>
          </div>

          {/* Last two tabs */}
          {tabs.slice(2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-emerald-600 scale-102' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-emerald-50' : ''}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
