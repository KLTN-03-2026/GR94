import React from "react";
import { ICategory } from "@/lib/category.api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeft, Trash, PencilSimple, Question } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { IconRenderer } from "@/components/ui/icon-renderer";

interface CategoryMobileDetailProps {
  category: ICategory | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
}

export function CategoryMobileDetail({
  category,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CategoryMobileDetailProps) {
  if (!category) return null;

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
            <SheetTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0">Chi tiết danh mục</SheetTitle>
          </div>
          {!category.isSystem && (
            <button 
              onClick={() => {
                onClose();
                onDelete(category);
              }} 
              className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-full transition-colors"
            >
              <Trash size={24} />
            </button>
          )}
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-12 items-center">
          <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 mb-8 shadow-xl shadow-green-600/10">
            <IconRenderer icon={category.icon || "Star"} size={56} weight="duotone" />
          </div>

          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 text-center">{category.name}</h3>
          
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="text-xs font-bold px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 uppercase tracking-widest">
              {category.type === "income" ? "Thu nhập" : "Chi phí"}
            </span>
            {category.isSystem && (
              <span className="text-xs font-bold px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Hệ thống
              </span>
            )}
          </div>
          
          <div className="w-full bg-white dark:bg-[#122017] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/60 shadow-sm mt-4">
             <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-sm font-medium text-slate-500">Mã danh mục</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{category._id}</span>
             </div>
             <div className="flex items-center justify-between pt-4">
                <span className="text-sm font-medium text-slate-500">Phân loại</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{category.isSystem ? 'Mặc định' : 'Tùy chỉnh'}</span>
             </div>
          </div>
        </div>

        {!category.isSystem && (
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto flex gap-3 pb-8 md:pb-4">
            <Button 
              className="flex-1 rounded-2xl h-14 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
              onClick={() => {
                onClose();
                onEdit(category);
              }}
            >
              <PencilSimple size={20} className="mr-2" weight="bold" />
              Chỉnh sửa danh mục
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
