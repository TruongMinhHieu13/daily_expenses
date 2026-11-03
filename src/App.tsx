import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { TabType, BottomNav } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { LedgerTab } from './components/LedgerTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { SettingsTab } from './components/SettingsTab';
import { TransactionModal } from './components/TransactionModal';
import { PinLockScreen } from './components/PinLockScreen';
import { NotificationToast } from './components/NotificationToast';
import { Transaction } from './types/finance';
import { Wifi, Battery, Signal } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAppLocked, toastMessage } = useFinance();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setModalDefaultDate(undefined);
    setIsModalOpen(true);
  };

  const handleOpenAddModalWithDate = (dateStr: string) => {
    setEditingTransaction(null);
    setModalDefaultDate(dateStr);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalDefaultDate(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setModalDefaultDate(undefined);
  };

  if (isAppLocked) {
    return <PinLockScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-200 sm:py-6 flex items-center justify-center font-sans antialiased">
      {/* Mobile-first smartphone canvas container */}
      <div className="w-full sm:max-w-[430px] min-h-screen sm:min-h-[860px] sm:max-h-[920px] bg-slate-50 sm:rounded-[40px] shadow-2xl sm:border-[8px] sm:border-slate-800 flex flex-col relative overflow-hidden">
        {/* Subtle Smartphone Status Bar for realistic feel on desktop/preview */}
        <div className="hidden sm:flex items-center justify-between px-7 pt-3 pb-1 text-slate-800 text-xs font-semibold select-none shrink-0">
          <span>9:41</span>
          <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={13} />
          </div>
        </div>

        {/* Global Toast Notification */}
        <NotificationToast message={toastMessage} />

        {/* Active Tab Content Screen */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardTab
              onOpenAddModal={handleOpenAddModal}
              onOpenAddModalWithDate={handleOpenAddModalWithDate}
              onEditTransaction={handleEditTransaction}
              onNavigateToLedger={() => setActiveTab('ledger')}
              onNavigateToAnalytics={() => setActiveTab('analytics')}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerTab
              onEditTransaction={handleEditTransaction}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsTab />}

          {activeTab === 'settings' && <SettingsTab />}
        </div>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Quick Add / Edit Transaction Sheet Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          editTransaction={editingTransaction}
          defaultDate={modalDefaultDate}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
