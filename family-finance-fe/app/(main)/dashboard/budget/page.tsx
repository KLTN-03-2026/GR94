"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PlusCircle, WarningCircle, SpinnerGap } from "@phosphor-icons/react";
import { MonthPicker } from "@/components/budget/month-picker";
import { BudgetSummary } from "@/components/budget/budget-summary";
import { BudgetCard } from "@/components/budget/budget-card";
import { BudgetModal } from "@/components/budget/budget-modal";
import { DeleteBudgetModal } from "@/components/budget/delete-budget-modal";
import { getBudgetsAction, deleteBudgetAction } from "@/lib/action";
import { useAuthStore } from "@/store/auth.store";
import { IBudget, IBudgetListResponse } from "@/types";
import { toast } from "sonner";

export default function BudgetPage() {
  // Auth & Roles
  const { user } = useAuthStore();
  const isParent = user?.role === "parent";

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState<IBudgetListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<IBudget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<IBudget | null>(null);

  // Data Fetching
  const fetchBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const res = await getBudgetsAction({
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
      });

      if (res.statusCode === 200 && res.data) {
        setData(res.data);
      } else {
        setIsError(true);
      }
    } catch (err) {
      console.error("fetchBudgets error:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Handlers
  const handleAddBudget = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: IBudget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (budget: IBudget) => {
    setBudgetToDelete(budget);
  };

  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    try {
      await deleteBudgetAction(budgetToDelete._id);
      toast.success("Xóa ngân sách thành công");
      fetchBudgets();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa ngân sách");
    } finally {
      setBudgetToDelete(null);
    }
  };

  // Logic for Member view (calculate summary if BE doesn't provide it)
  const effectiveSummary = data?.summary || {
    totalLimit:
      data?.budgets.reduce((acc, curr) => acc + (curr.limitAmount || 0), 0) ||
      0,
    totalSpent:
      data?.budgets.reduce((acc, curr) => acc + (curr.spentAmount || 0), 0) ||
      0,
    totalRemaining:
      data?.budgets.reduce((acc, curr) => acc + (curr.remaining || 0), 0) || 0,
    percentage: data?.budgets.length
      ? data.budgets.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
        data.budgets.length
      : 0,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tighter">
            Quản lý ngân sách
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Phân bổ hợp lý, gia đình sung túc.{" "}
            {isParent ? "(Chế độ Quản trị)" : "(Chế độ xem)"}
          </p>
        </div>

        {isParent && (
          <button
            onClick={handleAddBudget}
            className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-green-600/20 active:scale-95 transition-all"
          >
            <PlusCircle
              size={24}
              weight="fill"
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            Thiết lập ngân sách
          </button>
        )}
      </header>

      {/* Month Selection - Horizontal Scroll */}
      <MonthPicker selectedDate={selectedDate} onChange={setSelectedDate} />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-500">
          <SpinnerGap size={48} className="animate-spin text-green-600" />
          <p className="font-bold tracking-widest text-[11px] uppercase animate-pulse">
            Đang đồng bộ dữ liệu...
          </p>
        </div>
      ) : isError ? (
        <div className="py-20 flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
            <WarningCircle size={48} weight="duotone" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Gặp lỗi khi tải dữ liệu
            </h3>
            <p className="text-slate-500 max-w-xs">
              Vui lòng kiểm tra lại kết nối hoặc thử lại sau vài giây.
            </p>
          </div>
          <button
            onClick={fetchBudgets}
            className="px-8 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {/* Summary Section */}
          <BudgetSummary
            totalLimit={effectiveSummary.totalLimit}
            totalSpent={effectiveSummary.totalSpent}
            totalRemaining={effectiveSummary.totalRemaining}
            percentage={effectiveSummary.percentage}
          />

          {/* List Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Chi tiết hạng mục
              </h3>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {data?.budgets.length || 0} Hạng mục
              </span>
            </div>

            {data?.budgets.length === 0 ? (
              <div className="py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300">
                  <PlusCircle size={32} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-600 dark:text-slate-400">
                    Chưa có ngân sách nào được tạo
                  </p>
                  <p className="text-sm text-slate-400">
                    Hãy bắt đầu bằng cách nhấn "Thiết lập ngân sách"
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.budgets.map((budget) => (
                  <BudgetCard
                    key={budget._id}
                    budget={budget}
                    isParent={isParent}
                    onEdit={handleEditBudget}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Prosperity Tips (Matching Stitch Design) */}
          <section className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm space-y-3 flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                  <PlusCircle size={24} weight="fill" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  Thử thách Gia đình
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mục tiêu tiết kiệm đang tiến triển rất tốt nhờ sự đóng góp
                  tích cực từ tất cả thành viên.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm space-y-3 flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                  <PlusCircle size={24} weight="fill" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  Mẹo tiết kiệm
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sử dụng danh sách mua sắm cố định có thể giúp bạn tiết kiệm
                  thêm 15% mỗi tháng.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBudgets}
        editBudget={editingBudget}
        defaultMonth={selectedDate.getMonth() + 1}
        defaultYear={selectedDate.getFullYear()}
      />

      <DeleteBudgetModal
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={confirmDelete}
        categoryName={budgetToDelete?.categoryId.name || ""}
      />
    </div>
  );
}
