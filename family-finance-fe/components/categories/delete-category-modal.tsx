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

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  categoryName: string;
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
}: DeleteCategoryModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#122017] border-red-100 dark:border-red-900/30">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500 rounded-full">
              <WarningCircle size={28} weight="fill" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Xác nhận xóa
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 text-slate-600 dark:text-slate-400">
          Bạn có chắc chắn muốn xóa danh mục{" "}
          <strong className="text-slate-900 dark:text-white">
            "{categoryName}"
          </strong>{" "}
          không? Hành động này không thể hoàn tác.
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hủy bỏ
          </Button>
          <Button
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa danh mục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
