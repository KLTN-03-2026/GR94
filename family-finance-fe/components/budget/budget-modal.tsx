"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  createBudgetAction, 
  updateBudgetAction, 
  getCategoriesAction 
} from "@/lib/action";
import { ICategory } from "@/lib/category.api";
import { IBudget } from "@/types";
import { toast } from "sonner";
import * as PhosphorIcons from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editBudget?: IBudget | null;
  defaultMonth: number;
  defaultYear: number;
}

export function BudgetModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editBudget, 
  defaultMonth, 
  defaultYear 
}: BudgetModalProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isLoadingCats, setIsLoadingCats] = useState(false);

  const isEdit = !!editBudget;

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (editBudget) {
        setSelectedCategoryId(editBudget.categoryId._id);
        setLimitAmount(editBudget.limitAmount?.toString() || "");
      } else {
        setSelectedCategoryId("");
        setLimitAmount("");
      }
    }
  }, [isOpen, editBudget]);

  const loadCategories = async () => {
    try {
      setIsLoadingCats(true);
      const res = await getCategoriesAction();
      if (Array.isArray(res)) {
        // Only allow budgeting for expense categories
        setCategories(res.filter(c => c.type === "expense"));
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setIsLoadingCats(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategoryId) return toast.error("Vui lòng chọn danh mục");
    if (!limitAmount || parseFloat(limitAmount) <= 0) return toast.error("Vui lòng nhập số tiền hợp lệ");

    try {
      setIsPending(true);
      if (isEdit && editBudget) {
        await updateBudgetAction(editBudget._id, {
          limitAmount: parseFloat(limitAmount),
        });
        toast.success("Cập nhật ngân sách thành công");
      } else {
        await createBudgetAction({
          categoryId: selectedCategoryId,
          limitAmount: parseFloat(limitAmount),
          month: defaultMonth,
          year: defaultYear,
        });
        toast.success("Thiết lập ngân sách thành công");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xử lý ngân sách");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-[#122017] p-0 overflow-hidden border-none rounded-[2rem]">
        <div className="bg-green-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">
              {isEdit ? "Cập nhật ngân sách" : "Thiết lập ngân sách"}
            </DialogTitle>
            <p className="text-green-100/80 text-sm">
              {isEdit 
                ? "Điều chỉnh hạn mức chi tiêu cho danh mục này" 
                : `Tháng ${defaultMonth}/${defaultYear} - Kiểm soát chi tiêu gia đình`
              }
            </p>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          {/* Category Picker */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Chọn danh mục chi tiêu</Label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[220px] overflow-y-auto p-1 scrollbar-hide">
              {isLoadingCats ? (
                <div className="col-span-full py-4 text-center text-slate-400">Đang tải danh mục...</div>
              ) : categories.length === 0 ? (
                <div className="col-span-full py-4 text-center text-slate-400">Không có danh mục chi tiêu</div>
              ) : (
                categories.map((cat) => {
                  // @ts-ignore
                  const Icon = PhosphorIcons[cat.icon] || PhosphorIcons.Star;
                  const isSelected = selectedCategoryId === cat._id;
                  
                  return (
                    <button
                      key={cat._id}
                      disabled={isEdit} // Cant change category when editing
                      onClick={() => setSelectedCategoryId(cat._id)}
                      className={cn(
                        "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                        isSelected
                          ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/30"
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-800 dark:hover:bg-slate-800",
                        isEdit && !isSelected && "opacity-30 grayscale"
                      )}
                    >
                      <Icon size={24} weight={isSelected ? "fill" : "regular"} />
                      <span className="text-[10px] font-bold truncate w-full px-1">{cat.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">
              Hạn mức tối đa (VND)
            </Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                <PhosphorIcons.Money size={24} weight="bold" />
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="VD: 5.000.000"
                value={limitAmount}
                onChange={(e: any) => setLimitAmount(e.target.value)}
                className="pl-12 py-7 text-xl font-black rounded-2xl border-slate-200 focus-visible:ring-green-600 dark:bg-slate-800/50 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:flex-1 py-6 rounded-2xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50"
          >
            Hủy bỏ
          </Button>
          <Button 
            disabled={isPending}
            onClick={handleSubmit}
            className="w-full sm:flex-1 py-6 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black shadow-lg shadow-green-600/30"
          >
            {isPending ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Kích hoạt ngân sách"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
