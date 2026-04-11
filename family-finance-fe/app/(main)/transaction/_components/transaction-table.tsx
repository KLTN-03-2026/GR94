"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DotsThreeVertical,
  Wallet,
  Coffee,
  ShoppingCart,
  GraduationCap,
  TrendUp,
  Question,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { IIncome } from "@/types";

// Helper map icons (tạm thời)
const IconMap: Record<string, any> = {
  coffee: Coffee,
  shopping: ShoppingCart,
  education: GraduationCap,
  salary: TrendUp,
  food: Coffee,
};

interface TransactionTableProps {
  transactions: IIncome[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  // Nhóm giao dịch theo ngày
  const groupedTransactions = transactions.reduce(
    (acc, curr) => {
      const dateKey = format(new Date(curr.date), "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(curr);
      return acc;
    },
    {} as Record<string, IIncome[]>,
  );

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) =>
    b.localeCompare(a),
  );

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getRelativeDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"))
      return "HÔM NAY";
    if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd"))
      return "HÔM QUA";
    return format(date, "do MMMM, yyyy", { locale: vi }).toUpperCase();
  };

  return (
    <div className="w-full bg-white dark:bg-[#122017] rounded-2xl border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20">
          <TableRow>
            <TableHead className="w-[150px]">Ngày</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Ví sử dụng</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead className="w-[80px] text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDates.map((dateKey) => (
            <React.Fragment key={dateKey}>
              {/* Group Header */}
              <TableRow className="bg-slate-50/30 dark:bg-slate-900/10 hover:bg-transparent">
                <TableCell colSpan={5} className="py-2 px-4">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                    {getRelativeDateLabel(dateKey)}
                  </span>
                </TableCell>
              </TableRow>
              {/* Rows */}
              {groupedTransactions[dateKey].map((item) => {
                const IconComponent =
                  IconMap[item.categoryID.icon.toLowerCase()] || Question;
                return (
                  <TableRow
                    key={item._id}
                    className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                  >
                    <TableCell className="text-slate-500 text-sm">
                      {format(new Date(item.date), "HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{
                            backgroundColor: item.categoryID.color
                              ? `${item.categoryID.color}20`
                              : "#f1f5f9",
                            color: item.categoryID.color || "#64748b",
                          }}
                        >
                          <IconComponent weight="duotone" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                            {item.categoryID.name}
                          </span>
                          {item.description && (
                            <span className="text-xs text-slate-400 line-clamp-1">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-medium text-[11px] rounded-lg"
                      >
                        Ví chung
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600 dark:text-green-500">
                      + {formatAmount(item.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400">
                        <DotsThreeVertical size={20} weight="bold" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-40 text-center text-slate-500 italic"
              >
                Không có dữ liệu giao dịch
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
