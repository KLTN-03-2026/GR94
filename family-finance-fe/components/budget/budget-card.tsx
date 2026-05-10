"use client";

import React from "react";
import { IconRenderer } from "@/components/ui/icon-renderer";
import { 
  PencilSimple, 
  Trash, 
  CaretRight,
  Warning,
  Sparkle
} from "@phosphor-icons/react";
import { AiAdviceModal } from "./ai-advice-modal";
import { cn } from "@/lib/utils";
import { IBudget } from "@/types";

interface BudgetCardProps {
  budget: IBudget;
  onEdit?: (budget: IBudget) => void;
  onDelete?: (budget: IBudget) => void;
  isParent: boolean;
}

export function BudgetCard({ budget, onEdit, onDelete, isParent }: BudgetCardProps) {
  const [showAiModal, setShowAiModal] = React.useState(false);
  
  const percentage = budget.percentage;
  const isOverBudget = percentage > 100;
  
  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return "---";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const statusConfig = {
    LOW: { label: "Ổn định", color: "text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400" },
    MEDIUM: { label: "Trung bình", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400" },
    HIGH: { label: "Sắp hết", color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400" },
    EXCEEDED: { label: "Vượt mức", color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400" },
  };

  const currentStatus = statusConfig[budget.status] || statusConfig.LOW;

  return (
    <div className="group bg-white dark:bg-[#122017] border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-[2.5rem] flex flex-col gap-6 transition-all duration-300 hover:shadow-xl hover:shadow-green-900/5 dark:hover:shadow-green-400/5 hover:-translate-y-1 relative overflow-hidden">
      
      {/* Header Area */}
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
            isOverBudget 
              ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400" 
              : "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
          )}>
            <IconRenderer icon={budget.categoryId?.icon || ""} size={32} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {budget.categoryId?.name || 'Không xác định'}
            </h4>
            <span className={cn(
              "text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider",
              currentStatus.color
            )}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Action Buttons (Only for Parent) */}
        {isParent && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <button 
              onClick={() => onEdit?.(budget)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors"
            >
              <PencilSimple size={20} weight="bold" />
            </button>
            <button 
              onClick={() => onDelete?.(budget)}
              className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-rose-500 transition-colors"
            >
              <Trash size={20} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Area */}
      <div className="space-y-3 z-10">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-slate-500 dark:text-slate-400">Đã dùng: {percentage.toFixed(0)}%</span>
          <span className={cn(
            isOverBudget ? "text-rose-500" : "text-green-600 dark:text-green-400"
          )}>
            {formatCurrency(budget.spentAmount || 0)}
          </span>
        </div>
        
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-out rounded-full",
              isOverBudget ? "bg-rose-500" : "bg-green-500"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 pt-1">
          <span>Ngân sách</span>
          <span className="text-slate-900 dark:text-slate-200">
            {formatCurrency(budget.limitAmount || 0)}
          </span>
        </div>
      </div>

      {/* Bottom info for transparency */}
      <div className="flex justify-between items-center pt-2 z-10 border-t border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-1">
          {isOverBudget && <Warning size={14} className="text-rose-500" weight="bold" />}
          <span className={cn(
            "text-xs font-medium",
            isOverBudget ? "text-rose-500" : "text-slate-500 dark:text-slate-400"
          )}>
            {isOverBudget 
              ? `Vượt mức ${formatCurrency(Math.abs(budget.remaining || 0))}` 
              : `Còn lại ${formatCurrency(budget.remaining || 0)}`
            }
          </span>
        </div>
        
        <button
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-green-100 dark:hover:bg-green-500/20 transition-all active:scale-95 group/ai"
        >
          <Sparkle size={14} weight="fill" className="animate-pulse group-hover/ai:rotate-12 transition-transform" />
          <span>Gợi ý AI</span>
        </button>

        <CaretRight size={16} weight="bold" className="text-slate-300 dark:text-slate-700" />
      </div>

      <AiAdviceModal
        open={showAiModal}
        onOpenChange={setShowAiModal}
        budgetId={budget._id}
        categoryName={budget.categoryId?.name || 'Không xác định'}
      />

      {/* Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent group-hover:via-green-500/50 transition-all" />
    </div>
  );
}
