"use client";

import React from "react";
import { 
  TrendUp, 
  Wallet, 
  ChartPieSlice, 
  WarningCircle 
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface BudgetSummaryProps {
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  percentage: number;
  isLoading?: boolean;
}

export function BudgetSummary({ 
  totalLimit, 
  totalSpent, 
  totalRemaining, 
  percentage,
  isLoading = false 
}: BudgetSummaryProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getProgressColor = (percent: number) => {
    if (percent > 100) return "bg-rose-500";
    if (percent > 85) return "bg-orange-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Glass Card Summary */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600/90 to-green-800/90 dark:from-green-900/40 dark:to-[#0c140e] p-8 rounded-[2.5rem] border border-green-500/20 shadow-2xl shadow-green-900/20">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-green-100/80 font-bold uppercase tracking-widest text-[11px]">Tổng quan tháng này</h3>
            <div className="space-y-1">
              <p className="text-white text-4xl md:text-5xl font-black tracking-tighter">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-green-100/60 text-sm">
                Đã chi tiêu trên tổng <span className="text-white font-bold">{formatCurrency(totalLimit)}</span>
              </p>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">{percentage.toFixed(1)}% Đã dùng</span>
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                  {totalSpent > totalLimit ? "Vượt hạn mức!" : "Còn lại: " + formatCurrency(totalRemaining)}
                </span>
              </div>
              <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out rounded-full",
                    getProgressColor(percentage)
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 text-center min-w-[200px]">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <TrendUp size={32} className="text-white" weight="bold" />
            </div>
            <p className="text-green-50 text-[11px] font-bold uppercase tracking-tight">Tình trạng</p>
            <p className="text-white text-xl font-bold">
              {percentage > 100 ? "Báo động" : percentage > 80 ? "Cảnh báo" : "Ổn định"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Budget */}
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <Wallet size={28} className="text-blue-600 dark:text-blue-400" weight="fill" />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Tổng ngân sách</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalLimit)}</p>
          </div>
        </div>

        {/* Total Remaining */}
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <ChartPieSlice size={28} className="text-emerald-600 dark:text-emerald-400" weight="fill" />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Còn lại</p>
            <p className={cn(
              "text-xl font-bold",
              totalRemaining < 0 ? "text-rose-500" : "text-slate-900 dark:text-slate-100"
            )}>
              {formatCurrency(totalRemaining)}
            </p>
          </div>
        </div>

        {/* Status indicator for mobile or 3rd column */}
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-5 shadow-sm">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
            percentage > 90 ? "bg-rose-50 dark:bg-rose-500/10" : "bg-green-50 dark:bg-green-500/10"
          )}>
            <WarningCircle size={28} className={percentage > 90 ? "text-rose-600" : "text-green-600"} weight="fill" />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Cảnh báo</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {percentage > 100 ? "Vượt định mức" : percentage > 90 ? "Sắp hết" : "An toàn"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
