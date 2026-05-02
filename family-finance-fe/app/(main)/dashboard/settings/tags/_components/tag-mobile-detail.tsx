import React from "react";
import { ITag } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeft, Trash, PencilSimple, Tag as TagIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface TagMobileDetailProps {
  tag: ITag | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tag: ITag) => void;
  onDelete: (tag: ITag) => void;
}

export function TagMobileDetail({
  tag,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TagMobileDetailProps) {
  if (!tag) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="bottom" 
        showCloseButton={false}
        className="h-[100dvh] sm:h-[95vh] rounded-t-none sm:rounded-t-3xl p-0 flex flex-col bg-[#F8F9FA] dark:bg-slate-950"
      >
        <SheetHeader className="flex flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <ArrowLeft size={24} className="text-slate-700 dark:text-slate-300" />
            </button>
            <SheetTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0">Chi tiết nhãn</SheetTitle>
          </div>
          <button 
            onClick={() => {
              onClose();
              onDelete(tag);
            }} 
            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-full transition-colors"
          >
            <Trash size={24} />
          </button>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-12 items-center">
          <div 
            className="w-28 h-28 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-xl"
            style={{ backgroundColor: tag.color || "#10b981", boxShadow: `0 10px 25px -5px ${tag.color}60` }}
          >
            <TagIcon size={56} weight="duotone" />
          </div>

          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 text-center">{tag.name}</h3>
          
          <div className="flex items-center gap-3 mb-8 bg-white dark:bg-[#122017] px-6 py-3 rounded-full border border-slate-100 dark:border-slate-800/60 shadow-sm">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
              {tag.color}
            </span>
          </div>
          
          <div className="w-full bg-white dark:bg-[#122017] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/60 shadow-sm mt-4">
             <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Mã định danh</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{tag._id}</span>
             </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto flex gap-3 pb-8 md:pb-4">
          <Button 
            className="flex-1 rounded-2xl h-14 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
            onClick={() => {
              onClose();
              onEdit(tag);
            }}
          >
            <PencilSimple size={20} className="mr-2" weight="bold" />
            Chỉnh sửa nhãn
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
