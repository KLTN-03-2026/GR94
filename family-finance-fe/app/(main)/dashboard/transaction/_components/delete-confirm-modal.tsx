import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WarningCircle, Trash } from "@phosphor-icons/react";
import { ITransaction } from "@/types";

interface DeleteConfirmModalProps {
  transaction: ITransaction | null;
  type?: "income" | "expense";
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  transaction,
  type = "income",
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!transaction) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl border-none shadow-2xl overflow-hidden">
        {/* Soft warning background effect */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />
        
        <DialogHeader className="relative flex flex-col items-center gap-2 mb-2">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-2">
            <WarningCircle size={32} weight="duotone" className="text-rose-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">
            Xác nhận xoá giao dịch?
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
            Hành động này không thể hoàn tác. Giao dịch dưới đây sẽ bị xoá vĩnh viễn khỏi không gian quản lý của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 my-2 border border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Danh mục:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{transaction.categoryID?.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Số tiền:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{formatAmount(transaction.amount)}</span>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-12 font-medium"
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="default"
            className="flex-1 rounded-xl h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 transition-all border-none"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Đang xóa...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash size={18} weight="bold" />
                <span>Xóa luôn</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
