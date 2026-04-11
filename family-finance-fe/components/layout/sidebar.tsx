"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  ArrowsLeftRight,
  ChartPieSlice,
  Wallet,
  ChartBar,
  Gear,
  SignOut,
  User,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const menuItems = [
  { icon: House, label: "Tổng quan", href: "/dashboard" },
  { icon: ArrowsLeftRight, label: "Giao dịch", href: "/transaction" },
  { icon: ChartPieSlice, label: "Ngân sách", href: "/budget" },
  { icon: Wallet, label: "Tài khoản", href: "/accounts" },
  { icon: ChartBar, label: "Báo cáo", href: "/reports" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, clear } = useAuthStore();

  return (
    <aside className="w-64 bg-slate-50 dark:bg-[#0c140e] border-r border-slate-100 dark:border-slate-800/60 h-screen sticky top-0 flex flex-col p-6 overflow-y-auto shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Wallet size={24} weight="fill" />
        </div>
        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          GiaKế
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <item.icon
                size={22}
                weight={isActive ? "fill" : "bold"}
                className={cn(
                  "transition-colors",
                  isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Settings */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800/60 space-y-1">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 transition-all"
        >
          <User size={22} weight="bold" className="text-slate-400" />
          <span>Hồ sơ</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 transition-all"
        >
          <Gear size={22} weight="bold" className="text-slate-400" />
          <span>Cài đặt</span>
        </Link>
        <button
          onClick={clear}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <SignOut size={22} weight="bold" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
