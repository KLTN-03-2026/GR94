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
import { createTagAction, updateTagAction } from "@/lib/action";
import { Palette } from "@phosphor-icons/react";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCallback: () => void;
  editData?: {
    _id: string;
    name: string;
    color: string;
  } | null;
}

const COLORS = [
  "#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", 
  "#ec4899", "#06b6d4", "#71717a", "#4ade80", "#fb7185"
];

export function TagModal({ isOpen, onClose, onSuccessCallback, editData }: TagModalProps) {
  const isEdit = !!editData;

  const [name, setName] = useState(editData?.name ?? "");
  const [color, setColor] = useState(editData?.color ?? COLORS[0]);
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setName(editData?.name ?? "");
      setColor(editData?.color ?? COLORS[0]);
      setIsPending(false);
    }
    if (!open) onClose();
  };

  const onSubmit = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên tag");
      return;
    }

    try {
      setIsPending(true);
      if (isEdit && editData) {
        await updateTagAction(editData._id, { name, color });
        toast.success("Cập nhật tag thành công!");
      } else {
        await createTagAction({ name, color });
        toast.success("Tạo tag thành công!");
      }

      onSuccessCallback();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi lưu tag");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#122017] border-none rounded-3xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/60">
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-slate-100">
            {isEdit ? "Chỉnh sửa Tag" : "Thêm Tag mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Tên tag */}
          <div className="space-y-2">
            <Label htmlFor="tag-name" className="text-sm font-bold text-slate-600 dark:text-slate-400 ml-1">
              Tên Tag <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tag-name"
              placeholder="Ví dụ: Quan trọng, Cuối tuần..."
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              className="h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl font-medium focus-visible:ring-emerald-500/20"
            />
          </div>

          {/* Chọn Màu sắc */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-600 dark:text-slate-400 ml-1 flex items-center gap-2">
              <Palette size={18} weight="duotone" />
              Chọn Màu sắc
            </Label>
            <div className="grid grid-cols-5 gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 rounded-xl transition-all border-4 ${
                    color === c 
                      ? "border-slate-200 dark:border-slate-700 scale-110 shadow-lg" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isPending} 
            className="flex-1 h-12 rounded-xl font-bold"
          >
            Hủy
          </Button>
          <Button 
            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20" 
            onClick={onSubmit} 
            disabled={isPending}
          >
            {isPending ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Tạo Tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
