import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ITransaction } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  ArrowLeft, 
  Trash, 
  PencilSimple, 
  CalendarBlank,
  Question,
  Coffee,
  ShoppingCart,
  GraduationCap,
  TrendUp,
  Tag
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const IconMap: Record<string, any> = {
  coffee: Coffee,
  shopping: ShoppingCart,
  education: GraduationCap,
  salary: TrendUp,
  food: Coffee,
};

interface TransactionMobileDetailProps {
  transaction: ITransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (transaction: ITransaction) => void;
  onDelete: (transaction: ITransaction) => void;
  type?: "income" | "expense";
}

export function TransactionMobileDetail({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  type = "income"
}: TransactionMobileDetailProps) {
  const isIncome = type === "income";
  if (!transaction) return null;

  const IconComponent = IconMap[transaction.categoryID.icon?.toLowerCase() || ''] || Question;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Configure as a bottom sheet taking up 95% of the screen or full screen */}
      <SheetContent 
        side="bottom" 
        showCloseButton={false}
        className="h-screen sm:h-[95vh] rounded-t-none sm:rounded-t-3xl p-0 flex flex-col bg-[#F8F9FA] dark:bg-slate-950"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <ArrowLeft size={24} className="text-slate-700 dark:text-slate-300" />
            </button>
            <SheetTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0">Chi tiết giao dịch</SheetTitle>
          </div>
          <button 
            onClick={() => {
              onClose();
              onDelete(transaction);
            }} 
            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-full transition-colors"
          >
            <Trash size={24} />
          </button>
        </SheetHeader>

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-8 items-center">
          {/* Amount */}
          <div className="flex flex-col items-center justify-center -space-y-1 mb-8">
            <span className={`text-[40px] font-black tracking-tight ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'}`}>
              {isIncome ? '+' : '-'} {formatAmount(transaction.amount)}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              {isIncome ? 'Thêm vào' : 'Chi từ'} ví chung
            </span>
          </div>

          {/* Details Card */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-5">
            {/* Category */}
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ 
                  backgroundColor: transaction.categoryID.color ? `${transaction.categoryID.color}20` : '#f1f5f9',
                  color: transaction.categoryID.color || '#64748b'
                }}
              >
                <IconComponent weight="duotone" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Danh mục</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-base">
                  {transaction.categoryID.name}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            {/* Time */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                <CalendarBlank weight="duotone" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Thời gian</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {format(new Date(transaction.date), "dd/MM/yyyy HH:mm", { locale: vi })}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            {/* Note */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                <Tag weight="duotone" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Ghi chú</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                  {transaction.description || "Không có ghi chú"}
                </span>
              </div>
            </div>
            
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            {/* Paid By */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 dark:border-slate-800">
                {transaction.userID.avatar ? (
                  <img src={transaction.userID.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    {transaction.userID.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Thanh toán bởi</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {transaction.userID.name} (Ví chung)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto flex gap-3 pb-8 md:pb-4">
          <Button 
            className="flex-1 rounded-2xl h-14 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
            onClick={() => {
              onClose();
              onEdit(transaction);
            }}
          >
            <PencilSimple size={20} className="mr-2" weight="bold" />
            Sửa giao dịch
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
