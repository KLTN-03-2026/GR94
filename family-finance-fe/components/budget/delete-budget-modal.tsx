"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WarningCircle } from "@phosphor-icons/react";

interface DeleteBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  categoryName: string;
}

export function DeleteBudgetModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
}: DeleteBudgetModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#122017] border-red-100 dark:border-red-900/30 rounded-[2rem]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500 rounded-full">
              <WarningCircle size={28} weight="fill" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 font-black tracking-tight">
                Xác nhận xóa
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 text-slate-600 dark:text-slate-400 text-sm">
          Bạn có chắc chắn muốn xóa ngân sách cho danh mục{" "}
          <strong className="text-slate-900 dark:text-white">
            "{categoryName}"
          </strong>{" "}
          không? Các số liệu chi tiêu thực tế vẫn sẽ được giữ lại.
        </div>

        <DialogFooter className="sm:justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex-1 py-6 font-bold"
          >
            Hủy bỏ
          </Button>
          <Button
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm flex-1 py-6 font-black"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
