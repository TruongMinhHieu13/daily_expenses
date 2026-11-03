import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { Category, Transaction, UserSettings, MonthSummary } from '../types/finance';
import { ALL_DEFAULT_CATEGORIES } from '../constants/categories';
import { getCurrentMonthString } from '../utils/formatters';
import {
  auth,
  db,
  loginWithGoogle as fbLoginWithGoogle,
  loginWithGoogleRedirect as fbLoginWithGoogleRedirect,
  getRedirectLoginResult as fbGetRedirectLoginResult,
  logoutGoogle as fbLogoutGoogle,
  handleFirestoreError,
  OperationType,
  parseAuthError,
  AuthErrorInfo,
} from '../services/firebase';

interface FinanceContextType {
  currentUser: User | null;
  isAuthLoading: boolean;
  isCloudSyncing: boolean;
  authError: AuthErrorInfo | null;
  clearAuthError: () => void;
  loginWithGoogle: (useRedirect?: boolean) => Promise<void>;
  logoutGoogle: () => Promise<void>;
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  settings: UserSettings;
  isAppLocked: boolean;
  toastMessage: string | null;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearAllTransactions: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;
  toggleHideBalance: () => void;
  setMonthlyBudget: (amount: number) => void;
  setPinCode: (pin: string | null) => void;
  verifyPin: (pin: string) => boolean;
  lockApp: () => void;
  unlockApp: () => void;
  exportBackupJson: () => void;
  importBackupJson: (fileContent: string) => boolean;
  resetSampleData: () => void;
  showToast: (msg: string) => void;
  currentMonthSummary: MonthSummary;
  overallBalance: number;
}

const STORAGE_KEY_TX = 'so_thu_chi_transactions_v3';
const STORAGE_KEY_CAT = 'so_thu_chi_categories_v3';
const STORAGE_KEY_SETTINGS = 'so_thu_chi_settings_v3';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  const clearAuthError = () => setAuthError(null);

  // 1. Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: Transaction) => !t.id?.startsWith('tx_sample_'));
        }
      }
    } catch (e) {
      console.error('Error loading transactions from localStorage', e);
    }
    return [];
  });

  // 2. Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CAT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading categories from localStorage', e);
    }
    return ALL_DEFAULT_CATEGORIES;
  });

  // 3. Settings state
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
    return {
      hideBalance: false,
      pinEnabled: false,
      pinCode: '',
      currency: 'VND',
      monthlyBudget: 15000000,
    };
  });

  // 4. UI navigation & security states
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthString());
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed: UserSettings = JSON.parse(saved);
        return parsed.pinEnabled && Boolean(parsed.pinCode);
      }
    } catch (e) {
      // ignore
    }
    return false;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);

      if (user) {
        // Save user profile doc
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(
            userDocRef,
            {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Could not update user profile doc', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Check redirect login result if user was redirected from Google
  useEffect(() => {
    fbGetRedirectLoginResult()
      .then((user) => {
        if (user) {
          showToast(`Chào mừng, ${user.displayName || user.email}! Đã kết nối đám mây.`);
        }
      })
      .catch((err) => {
        console.error('Redirect login error', err);
        setAuthError(parseAuthError(err));
      });
  }, []);

  // Listen to Firestore real-time updates when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    setIsCloudSyncing(true);
    const txPath = `users/${currentUser.uid}/transactions`;
    const catPath = `users/${currentUser.uid}/categories`;
    const settingsPath = `users/${currentUser.uid}/settings/preferences`;

    // 1. Transactions listener
    const txColRef = collection(db, 'users', currentUser.uid, 'transactions');
    const unsubTx = onSnapshot(
      txColRef,
      (snapshot) => {
        const cloudTxs: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          cloudTxs.push(docSnap.data() as Transaction);
        });

        // If cloud is empty but local had transactions, auto-migrate to cloud
        if (cloudTxs.length === 0 && transactions.length > 0) {
          migrateLocalToCloud(currentUser.uid, transactions);
        } else {
          setTransactions(cloudTxs);
        }
        setIsCloudSyncing(false);
      },
      (error) => {
        setIsCloudSyncing(false);
        handleFirestoreError(error, OperationType.GET, txPath);
      }
    );

    // 2. Categories listener
    const catColRef = collection(db, 'users', currentUser.uid, 'categories');
    const unsubCat = onSnapshot(
      catColRef,
      (snapshot) => {
        const customCats: Category[] = [];
        snapshot.forEach((docSnap) => {
          customCats.push(docSnap.data() as Category);
        });
        if (customCats.length > 0) {
          // Merge custom categories with default
          const defaultIds = new Set(ALL_DEFAULT_CATEGORIES.map((c) => c.id));
          const filteredCustom = customCats.filter((c) => !defaultIds.has(c.id));
          setCategories([...ALL_DEFAULT_CATEGORIES, ...filteredCustom]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, catPath);
      }
    );

    // 3. Settings listener
    const settingsDocRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
    const unsubSettings = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudSettings = docSnap.data() as UserSettings;
          setSettings((prev) => ({ ...prev, ...cloudSettings }));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, settingsPath);
      }
    );

    return () => {
      unsubTx();
      unsubCat();
      unsubSettings();
    };
  }, [currentUser]);

  // Helper to migrate existing local transactions to Firestore on first sign-in
  const migrateLocalToCloud = async (uid: string, localTxs: Transaction[]) => {
    try {
      const batch = writeBatch(db);
      for (const t of localTxs) {
        const ref = doc(db, 'users', uid, 'transactions', t.id);
        batch.set(ref, { ...t, userId: uid });
      }
      await batch.commit();
      showToast('Đã tự động đồng bộ dữ liệu cục bộ lên đám mây Cloud!');
    } catch (e) {
      console.warn('Migration to cloud error', e);
    }
  };

  // Keep local storage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Google Login / Logout
  const loginWithGoogle = async (useRedirect = false) => {
    try {
      setIsCloudSyncing(true);
      setAuthError(null);
      if (useRedirect) {
        await fbLoginWithGoogleRedirect();
        return;
      }
      const user = await fbLoginWithGoogle();
      setCurrentUser(user);
      showToast(`Chào mừng, ${user.displayName || user.email}! Đã kết nối đám mây.`);
    } catch (error) {
      console.error('Login error', error);
      const parsed = parseAuthError(error);
      setAuthError(parsed);
      if (parsed.helpType === 'popup-closed') {
        showToast('Cửa sổ đăng nhập đã bị đóng');
      } else if (parsed.helpType === 'unauthorized-domain') {
        showToast('Tên miền chưa được cấp phép trong Firebase');
      } else if (parsed.helpType === 'popup-blocked') {
        showToast('Cửa sổ đăng nhập đã bị trình duyệt chặn');
      } else {
        showToast('Đăng nhập Google thất bại');
      }
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const logoutGoogle = async () => {
    try {
      await fbLogoutGoogle();
      setCurrentUser(null);
      showToast('Đã đăng xuất tài khoản Google');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  // Transaction mutations (Cloud + Local)
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTx: Transaction = {
      ...txData,
      id: txId,
      userId: currentUser?.uid || 'guest',
      createdAt: Date.now(),
    };

    if (currentUser) {
      const path = `users/${currentUser.uid}/transactions/${txId}`;
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'transactions', txId), newTx);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    } else {
      setTransactions((prev) => [newTx, ...prev]);
    }

    showToast(txData.type === 'income' ? 'Đã thêm khoản thu (Đã lưu Cloud)' : 'Đã ghi chép khoản chi (Đã lưu Cloud)');
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (currentUser) {
      const path = `users/${currentUser.uid}/transactions/${id}`;
      try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'transactions', id), {
          ...updates,
          updatedAt: Date.now(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      setTransactions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item))
      );
    }
    showToast('Đã cập nhật giao dịch');
  };

  const deleteTransaction = async (id: string) => {
    if (currentUser) {
      const path = `users/${currentUser.uid}/transactions/${id}`;
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'transactions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      setTransactions((prev) => prev.filter((item) => item.id !== id));
    }
    showToast('Đã xóa giao dịch');
  };

  const clearAllTransactions = async () => {
    if (currentUser) {
      try {
        const colRef = collection(db, 'users', currentUser.uid, 'transactions');
        const snap = await getDocs(colRef);
        const batch = writeBatch(db);
        snap.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (e) {
        console.error('Error clearing cloud transactions', e);
      }
    }
    setTransactions([]);
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([]));
    } catch (e) {
      // ignore
    }
    showToast('Đã xóa toàn bộ dữ liệu giao dịch');
  };

  // Category mutations
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    const catId = `cat_custom_${Date.now()}`;
    const newCat: Category = {
      ...categoryData,
      id: catId,
      userId: currentUser?.uid || 'guest',
      isCustom: true,
    };

    if (currentUser) {
      const path = `users/${currentUser.uid}/categories/${catId}`;
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'categories', catId), newCat);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    } else {
      setCategories((prev) => [...prev, newCat]);
    }

    showToast(`Đã thêm danh mục "${newCat.name}"`);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (currentUser) {
      const path = `users/${currentUser.uid}/categories/${id}`;
      try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'categories', id), updates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    }
    showToast('Đã cập nhật danh mục');
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const inUse = transactions.some((t) => t.categoryId === id);
    if (inUse) {
      showToast('Không thể xóa danh mục đang có giao dịch sử dụng');
      return false;
    }

    if (currentUser) {
      const path = `users/${currentUser.uid}/categories/${id}`;
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'categories', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }

    showToast('Đã xóa danh mục');
    return true;
  };

  // Settings mutations
  const toggleHideBalance = () => {
    const newVal = !settings.hideBalance;
    setSettings((prev) => ({ ...prev, hideBalance: newVal }));
    if (currentUser) {
      setDoc(
        doc(db, 'users', currentUser.uid, 'settings', 'preferences'),
        { hideBalance: newVal },
        { merge: true }
      ).catch(console.warn);
    }
  };

  const setMonthlyBudget = (amount: number) => {
    setSettings((prev) => ({ ...prev, monthlyBudget: amount }));
    if (currentUser) {
      setDoc(
        doc(db, 'users', currentUser.uid, 'settings', 'preferences'),
        { monthlyBudget: amount },
        { merge: true }
      ).catch(console.warn);
    }
    showToast('Đã cập nhật ngân sách tháng');
  };

  const setPinCode = (pin: string | null) => {
    if (pin && pin.length === 4) {
      const newSettings = { pinEnabled: true, pinCode: pin };
      setSettings((prev) => ({ ...prev, ...newSettings }));
      setIsAppLocked(false);
      if (currentUser) {
        setDoc(
          doc(db, 'users', currentUser.uid, 'settings', 'preferences'),
          newSettings,
          { merge: true }
        ).catch(console.warn);
      }
      showToast('Đã bật bảo mật mã PIN 4 số');
    } else {
      const newSettings = { pinEnabled: false, pinCode: '' };
      setSettings((prev) => ({ ...prev, ...newSettings }));
      setIsAppLocked(false);
      if (currentUser) {
        setDoc(
          doc(db, 'users', currentUser.uid, 'settings', 'preferences'),
          newSettings,
          { merge: true }
        ).catch(console.warn);
      }
      showToast('Đã tắt bảo mật mã PIN');
    }
  };

  const verifyPin = (pin: string): boolean => {
    if (!settings.pinEnabled || !settings.pinCode) return true;
    if (settings.pinCode === pin) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (settings.pinEnabled && settings.pinCode) {
      setIsAppLocked(true);
    }
  };

  const unlockApp = () => {
    setIsAppLocked(false);
  };

  // Backup & Restore
  const exportBackupJson = () => {
    const backupData = {
      version: 3,
      exportDate: new Date().toISOString(),
      transactions,
      categories,
      settings,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sothuchi_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã xuất file sao lưu dữ liệu (.json)');
  };

  const importBackupJson = (fileContent: string): boolean => {
    try {
      const data = JSON.parse(fileContent);
      if (data && Array.isArray(data.transactions) && Array.isArray(data.categories)) {
        setTransactions(data.transactions);
        setCategories(data.categories);
        if (data.settings) {
          setSettings(data.settings);
        }
        if (currentUser) {
          migrateLocalToCloud(currentUser.uid, data.transactions);
        }
        showToast('Khôi phục dữ liệu sao lưu thành công!');
        return true;
      }
      throw new Error('Định dạng file không hợp lệ');
    } catch (e) {
      console.error(e);
      showToast('Lỗi: File sao lưu không hợp lệ');
      return false;
    }
  };

  const resetSampleData = () => {
    clearAllTransactions();
  };

  // Overall total balance (all time)
  const overallBalance = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') return acc + curr.amount;
      return acc - curr.amount;
    }, 0);
  }, [transactions]);

  // Current selected month summary
  const currentMonthSummary = useMemo<MonthSummary>(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let count = 0;

    for (const tx of transactions) {
      if (tx.date.startsWith(selectedMonth)) {
        count++;
        if (tx.type === 'income') {
          totalIncome += tx.amount;
        } else {
          totalExpense += tx.amount;
        }
      }
    }

    return {
      monthStr: selectedMonth,
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      transactionCount: count,
    };
  }, [transactions, selectedMonth]);

  const value = {
    currentUser,
    isAuthLoading,
    isCloudSyncing,
    authError,
    clearAuthError,
    loginWithGoogle,
    logoutGoogle,
    transactions,
    categories,
    selectedMonth,
    setSelectedMonth,
    settings,
    isAppLocked,
    toastMessage,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleHideBalance,
    setMonthlyBudget,
    setPinCode,
    verifyPin,
    lockApp,
    unlockApp,
    exportBackupJson,
    importBackupJson,
    resetSampleData,
    showToast,
    currentMonthSummary,
    overallBalance,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
