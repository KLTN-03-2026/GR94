"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryType } from "@/lib/category.api";
import { createCategoryAction, updateCategoryAction } from "@/lib/action";
import * as PhosphorIcons from "@phosphor-icons/react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCallback: () => void;
  // If editing, pass the editData
  editData?: {
    id: string;
    name: string;
    icon: string;
    type: CategoryType;
  } | null;
  defaultType?: CategoryType;
}

// Danh sách các icon gợi ý
const ICON_OPTIONS = [
  "ForkKnife", "Car", "House", "ShoppingCart", "Coffee",
  "ChartLineUp", "TrendUp", "Wallet", "Bank", "Money",
  "GraduationCap", "FirstAid", "FilmStrip", "Heart", "Star"
];

export function CategoryModal({ isOpen, onClose, onSuccessCallback, editData, defaultType = "expense" }: CategoryModalProps) {
  const isEdit = !!editData;

  const [name, setName] = useState(editData?.name ?? "");
  const [icon, setIcon] = useState(editData?.icon ?? "Wallet");
  const [type, setType] = useState<CategoryType>(editData?.type ?? defaultType);
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setName(editData?.name ?? "");
      setIcon(editData?.icon ?? "Wallet");
      setType(editData?.type ?? defaultType);
      setIsPending(false);
    }
    if (!open) onClose();
  };

  const onSubmit = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setIsPending(true);
      if (isEdit && editData) {
        // GỌI API SỬA (PATCH)
        await updateCategoryAction(editData.id, { name, icon, type });
        toast.success("Cập nhật danh mục thành công!");
      } else {
        // GỌI API TẠO (POST)
        await createCategoryAction({ name, icon, type });
        toast.success("Tạo danh mục thành công!");
      }

      // Xong thì gọi hàm báo thành công để component cha tải lại dữ liệu
      onSuccessCallback();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi lưu danh mục");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#122017]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Chỉnh sửa Danh mục" : "Thêm Danh mục mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Loại giao dịch */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Loại giao dịch</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 rounded-xl border text-sm font-medium transition-colors ${
                  type === "expense"
                    ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
                    : "bg-transparent border-slate-200 text-slate-500 dark:border-slate-800"
                }`}
              >
                Khoản Chi
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 rounded-xl border text-sm font-medium transition-colors ${
                  type === "income"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                    : "bg-transparent border-slate-200 text-slate-500 dark:border-slate-800"
                }`}
              >
                Khoản Thu
              </button>
            </div>
          </div>

          {/* Tên danh mục */}
          <div className="space-y-2">
            <Label htmlFor="cat-name" className="text-sm font-semibold">
              Tên danh mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cat-name"
              placeholder="VD: Ăn uống, Di chuyển..."
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Chọn Icon */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Chọn Biểu tượng</Label>
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
              {ICON_OPTIONS.map((iconName) => {
                // Determine icon component
                // @ts-ignore
                const IconComponent = PhosphorIcons[iconName] || PhosphorIcons.Star;
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${
                      icon === iconName
                        ? "bg-green-50 border-green-500 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                        : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <IconComponent size={24} weight={icon === iconName ? "duotone" : "regular"} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending} className="rounded-xl">
            Hủy
          </Button>
          <Button 
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white" 
            onClick={onSubmit} 
            disabled={isPending}
          >
            {isPending ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Tạo danh mục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
