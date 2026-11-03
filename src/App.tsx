// App.tsx
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
import { AuthErrorModal } from './components/AuthErrorModal';
import { Transaction } from './types/finance';

const MainApp: React.FC = () => {
  const { isAppLocked, toastMessage, authError, clearAuthError, loginWithGoogle } = useFinance();

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
      <div className="w-full sm:max-w-[430px] min-h-screen sm:min-h-[860px] sm:max-h-[920px] bg-slate-50 sm:rounded-[36px] shadow-2xl sm:border sm:border-slate-300/80 flex flex-col relative overflow-hidden">
        {/* Global Toast Notification */}
        <NotificationToast message={toastMessage} />

        {/* Active Tab Content Screen with Safe Area Top Clearance for Real Mobile Notches / Dynamic Island */}
        <div className="flex-1 overflow-y-auto no-scrollbar pt-[max(env(safe-area-inset-top,0px),20px)] sm:pt-4">
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

        {/* Auth Error Guidance & Diagnostic Modal */}
        <AuthErrorModal
          authError={authError}
          onClose={clearAuthError}
          onRetryPopup={() => loginWithGoogle(false)}
          onRetryRedirect={() => loginWithGoogle(true)}
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
