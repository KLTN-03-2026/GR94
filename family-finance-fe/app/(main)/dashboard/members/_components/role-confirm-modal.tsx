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
import { Shield, Star } from "@phosphor-icons/react";

interface RoleConfirmModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  targetRole: "parent" | "member";
}

export function RoleConfirmModal({
  member,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  targetRole,
}: RoleConfirmModalProps) {
  if (!member) return null;

  const isUpgrading = targetRole === "parent";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl border-none shadow-2xl overflow-hidden">
        {/* Soft background effect */}
        <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full blur-2xl ${isUpgrading ? "bg-amber-500/10" : "bg-slate-500/10"}`} />
        
        <DialogHeader className="relative flex flex-col items-center gap-2 mb-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isUpgrading ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500" : "bg-slate-50 dark:bg-slate-500/10 text-slate-500"}`}>
            {isUpgrading ? <Star size={32} weight="duotone" /> : <Shield size={32} weight="duotone" />}
          </div>
          <DialogTitle className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">
            {isUpgrading ? "Thăng cấp quản lý?" : "Huỷ quyền quản lý?"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
            {isUpgrading 
              ? `Bạn có chắc chắn muốn cấp quyền "Quản lý" (Parent) cho ${member.name}? Họ sẽ có khả năng chỉnh sửa không gian và quản lý thành viên khác.` 
              : `Bạn có chắc chắn muốn huỷ quyền "Quản lý" của ${member.name}? Họ sẽ trở thành thành viên thường.`}
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
            className={`flex-1 rounded-xl h-12 text-white font-bold transition-all border-none shadow-lg ${isUpgrading ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" : "bg-slate-800 hover:bg-slate-900 shadow-slate-800/20 dark:bg-slate-700 dark:hover:bg-slate-600"}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </div>
            ) : (
              <span>Xác nhận</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
