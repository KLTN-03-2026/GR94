"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteTagAction } from "@/lib/action";
import { Warning } from "@phosphor-icons/react";

interface DeleteTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCallback: () => void;
  tagData: {
    id: string;
    name: string;
  } | null;
}

export function DeleteTagModal({ isOpen, onClose, onSuccessCallback, tagData }: DeleteTagModalProps) {
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async () => {
    if (!tagData) return;

    try {
      setIsPending(true);
      await deleteTagAction(tagData._id);
      toast.success("Xóa tag thành công!");
      onSuccessCallback();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa tag");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#122017] border-none rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Warning size={32} weight="duotone" />
          </div>
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-slate-100 text-center">
            Xác nhận xóa Tag?
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 dark:text-slate-400 font-medium">
            Bạn có chắc chắn muốn xóa tag <span className="font-bold text-slate-900 dark:text-slate-100 italic">"{tagData?.name}"</span>? 
            Thao tác này sẽ gỡ bỏ tag khỏi tất cả giao dịch liên quan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isPending} 
            className="flex-1 h-12 rounded-xl font-bold"
          >
            Hủy
          </Button>
          <Button 
            variant="destructive"
            className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 border-none" 
            onClick={onSubmit} 
            disabled={isPending}
          >
            {isPending ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
