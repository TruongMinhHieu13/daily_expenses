import React, { useState, useRef } from 'react';
import {
  Shield,
  Tag,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Lock,
  DollarSign,
  Smartphone,
  Check,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Category, TransactionType } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { PWAInstallButton } from './PWAInstallButton';
import { CloudSyncBar } from './CloudSyncBar';
import { ReloadButton } from './ReloadButton';
import {
  AVAILABLE_CATEGORY_ICONS,
  CATEGORY_COLOR_PALETTE,
} from '../constants/categories';
import { formatVND } from '../utils/formatters';

export const SettingsTab: React.FC = () => {
  const {
    categories,
    settings,
    addCategory,
    updateCategory,
    deleteCategory,
    setMonthlyBudget,
    setPinCode,
    lockApp,
    exportBackupJson,
    importBackupJson,
    resetSampleData,
    showToast,
  } = useFinance();

  // Category modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<TransactionType>('expense');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catColor, setCatColor] = useState('#EF4444');

  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(settings.monthlyBudget || 15000000));

  // Reset confirm modal state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category management handlers
  const handleOpenAddCategory = (type: TransactionType = 'expense') => {
    setEditingCategory(null);
    setCatName('');
    setCatType(type);
    setCatIcon('Tag');
    setCatColor(type === 'expense' ? '#EF4444' : '#10B981');
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatIcon(cat.icon);
    setCatColor(cat.color);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('Vui lòng nhập tên danh mục');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        icon: catIcon,
        color: catColor,
      });
    } else {
      addCategory({
        name: catName.trim(),
        type: catType,
        icon: catIcon,
        color: catColor,
      });
    }

    setShowCategoryModal(false);
  };

  // PIN handlers
  const handleSavePin = () => {
    if (pinInput.length === 4) {
      setPinCode(pinInput);
      setShowPinModal(false);
      setPinInput('');
    } else {
      showToast('Mã PIN phải gồm đúng 4 chữ số');
    }
  };

  const handleDisablePin = () => {
    setPinCode(null);
    setShowPinModal(false);
    setPinInput('');
  };

  // File import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackupJson(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 text-slate-800">
      {/* Page Title & Reload */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cài đặt & Tiện ích</h2>
          <p className="text-2xs text-slate-400">Tùy biến danh mục, ngân sách và bảo mật</p>
        </div>
        <ReloadButton />
      </div>

      {/* Cloud Account & Realtime Sync Card */}
      <CloudSyncBar />

      {/* PWA Install Promotion Box */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-4 text-white shadow-md shadow-emerald-600/15">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
            <Smartphone size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Cài đặt ứng dụng vào điện thoại</h3>
            <p className="text-2xs text-emerald-100 mt-0.5">
              Dùng như app di động native, truy cập tức thì từ màn hình chính
            </p>
          </div>
        </div>
        <div className="mt-3">
          <PWAInstallButton />
        </div>
      </div>

      {/* Section 1: Financial Budget & Preferences */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign size={15} className="text-emerald-600" />
          <span>Mục tiêu & Hạn mức chi tiêu</span>
        </h3>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-xs font-bold text-slate-800">Ngân sách chi tiêu tháng</p>
            <p className="text-2xs text-slate-400">
              Hiện tại: {formatVND(settings.monthlyBudget)}
            </p>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Thay đổi
          </button>
        </div>
      </div>

      {/* Section 2: Security & Privacy PIN Lock */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Shield size={15} className="text-emerald-600" />
          <span>Bảo mật & Quyền riêng tư</span>
        </h3>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-xs font-bold text-slate-800">Khóa ứng dụng bằng mã PIN</p>
            <p className="text-2xs text-slate-400">
              {settings.pinEnabled
                ? 'Đã bật bảo vệ PIN 4 số khi mở ứng dụng'
                : 'Chưa cài đặt mã PIN bảo vệ'}
            </p>
          </div>

          <button
            onClick={() => setShowPinModal(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              settings.pinEnabled
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {settings.pinEnabled ? 'Đổi / Tắt PIN' : 'Cài mã PIN'}
          </button>
        </div>

        {settings.pinEnabled && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={lockApp}
              className="flex items-center gap-1 text-2xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl"
            >
              <Lock size={12} />
              <span>Khóa ngay bây giờ</span>
            </button>
          </div>
        )}
      </div>

      {/* Section 3: Category Management (Quản lý danh mục) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={15} className="text-emerald-600" />
            <span>Quản lý danh mục thu chi</span>
          </h3>
          <button
            onClick={() => handleOpenAddCategory('expense')}
            className="flex items-center gap-1 text-2xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl"
          >
            <Plus size={13} />
            <span>Thêm mới</span>
          </button>
        </div>

        {/* Expense Categories List */}
        <div>
          <div className="flex items-center justify-between text-2xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Danh mục chi tiêu ({expenseCategories.length})</span>
            <button
              onClick={() => handleOpenAddCategory('expense')}
              className="text-emerald-600 hover:underline"
            >
              + Thêm chi
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {expenseCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon iconName={cat.icon} size={14} color="#FFFFFF" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 shrink-0 ml-1">
                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={13} />
                  </button>
                  {cat.isCustom && (
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1 text-rose-400 hover:text-rose-600 rounded-md"
                      title="Xóa danh mục"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income Categories List */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-2xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Danh mục thu nhập ({incomeCategories.length})</span>
            <button
              onClick={() => handleOpenAddCategory('income')}
              className="text-emerald-600 hover:underline"
            >
              + Thêm thu
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {incomeCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon iconName={cat.icon} size={14} color="#FFFFFF" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 shrink-0 ml-1">
                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={13} />
                  </button>
                  {cat.isCustom && (
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1 text-rose-400 hover:text-rose-600 rounded-md"
                      title="Xóa danh mục"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Data Backup & Restore */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Download size={15} className="text-emerald-600" />
          <span>Sao lưu & Phục hồi dữ liệu</span>
        </h3>
        <p className="text-2xs text-slate-500 leading-relaxed">
          Toàn bộ lịch sử thu chi được lưu trữ an toàn trong trình duyệt. Bạn có thể xuất file sao lưu để chuyển sang máy khác hoặc khôi phục khi cần.
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={exportBackupJson}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <Download size={15} />
            <span>Xuất file JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold active:scale-95 transition"
          >
            <Upload size={15} />
            <span>Nhập file sao lưu</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-2xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <RotateCcw size={13} />
            <span>Xóa toàn bộ dữ liệu giao dịch (Đặt lại về 0)</span>
          </button>
        </div>
      </div>

      {/* App Info Footer */}
      <div className="text-center py-2 text-2xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-600">Sổ Thu Chi Cá Nhân • Phiên bản 2.0</p>
        <p>Thiết kế chuẩn Mobile-First • Fintech UI • Bảo mật cục bộ</p>
      </div>

      {/* Category Add/Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="py-3 space-y-3.5 text-xs">
              {/* Type toggle */}
              {!editingCategory && (
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCatType('expense');
                      setCatColor('#EF4444');
                    }}
                    className={`py-1.5 rounded-lg font-bold text-2xs transition ${
                      catType === 'expense'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Khoản Chi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCatType('income');
                      setCatColor('#10B981');
                    }}
                    className={`py-1.5 rounded-lg font-bold text-2xs transition ${
                      catType === 'income'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Khoản Thu
                  </button>
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-2xs">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cà phê, Đầu tư, Học tập..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white text-xs font-semibold"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-2xs">
                  Chọn biểu tượng
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
                  {AVAILABLE_CATEGORY_ICONS.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setCatIcon(ico)}
                      className={`p-2 rounded-xl flex items-center justify-center transition ${
                        catIcon === ico
                          ? 'bg-white shadow-md ring-2 ring-emerald-500'
                          : 'hover:bg-white text-slate-600'
                      }`}
                    >
                      <CategoryIcon iconName={ico} size={18} color={catColor} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-2xs">
                  Màu sắc
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {CATEGORY_COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatColor(c)}
                      className={`w-6 h-6 rounded-full shrink-0 transition-transform ${
                        catColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-800' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  Lưu danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Cài đặt mã PIN bảo vệ</h3>
              <button
                onClick={() => setShowPinModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-2xs text-slate-500">
              Nhập 4 chữ số bí mật để khóa ứng dụng khi bạn rời khỏi màn hình.
            </p>

            <div>
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="****"
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                className="w-full text-center tracking-[0.5em] text-2xl font-bold font-mono-numbers py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {settings.pinEnabled ? (
                <button
                  type="button"
                  onClick={handleDisablePin}
                  className="py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                >
                  Tắt bảo vệ PIN
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Hủy
                </button>
              )}
              <button
                type="button"
                onClick={handleSavePin}
                className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Lưu mã PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Budget Setup Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Hạn mức chi tiêu tháng</h3>
              <button
                onClick={() => setShowBudgetModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-2xs text-slate-500">
              Đặt số tiền tối đa bạn muốn chi tiêu trong một tháng để theo dõi tiến độ.
            </p>

            <div>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="VD: 15000000"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value.replace(/[^\d]/g, ''))}
                className="w-full text-lg font-bold font-mono-numbers px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 focus:bg-white"
              />
              <span className="block text-2xs text-slate-400 mt-1">
                = {formatVND(parseInt(budgetInput, 10) || 0)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseInt(budgetInput, 10) || 0;
                  setMonthlyBudget(val);
                  setShowBudgetModal(false);
                }}
                className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                Lưu hạn mức
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Xác nhận xóa toàn bộ giao dịch?</h3>
              <p className="text-2xs text-slate-500 mt-1">
                Toàn bộ các khoản thu chi đã ghi chép sẽ được xóa sạch về 0. Bạn có chắc chắn muốn thực hiện?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  resetSampleData();
                  setShowResetConfirm(false);
                }}
                className="py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/30"
              >
                Xóa sạch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
