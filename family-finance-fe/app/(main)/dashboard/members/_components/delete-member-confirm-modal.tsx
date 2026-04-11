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
import { UserMinus } from "@phosphor-icons/react";

interface DeleteMemberConfirmModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteMemberConfirmModal({
  member,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteMemberConfirmModalProps) {
  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl border-none shadow-2xl overflow-hidden">
        {/* Soft warning background effect */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />
        
        <DialogHeader className="relative flex flex-col items-center gap-2 mb-2">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-2">
            <UserMinus size={32} weight="duotone" className="text-rose-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">
            Xoá thành viên?
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">{member.name}</strong> sẽ bị xoá khỏi không gian này và không thể truy cập các dữ liệu chung nữa.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-12 font-medium"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="default"
            className="flex-1 rounded-xl h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 transition-all border-none"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserMinus size={18} weight="bold" />
                <span>Xóa thành viên</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
