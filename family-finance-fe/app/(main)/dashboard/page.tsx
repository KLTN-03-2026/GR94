"use client";
import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Coffee,
  ShoppingCart,
  GraduationCap,
  TrendUp,
  Users,
  User,
  Gear,
  WarningCircle,
} from "@phosphor-icons/react";
import * as PhosphorIcons from "@phosphor-icons/react";
import { useAuthStore } from "@/store/auth.store";
import { getDashboardSummaryAction, getCategoriesAction } from "@/lib/action";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { AddTransactionModal } from "./transaction/_components/add-transaction-modal";

// Helper function to render correct icon if needed, or you could use a dynamic icon mapping
// But for now we just show string icon or fallback.

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Tránh lỗi hydration mismatch do Zustand persist store lưu ở client
  const [mounted, setMounted] = React.useState(false);
  const [modalType, setModalType] = React.useState<"income" | "expense">(
    "expense",
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await getDashboardSummaryAction();
      return res?.data || null;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategoriesAction();
      return res;
    },
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#10b981",
    "#f43f5e",
    "#0ea5e9",
  ]; // Fallback colors

  // Custom Tooltip for Recharts Pie
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
          <p className="font-semibold text-sm mb-1">{payload[0].name}</p>
          <p
            className="text-sm font-bold"
            style={{ color: payload[0].payload.color || payload[0].color }}
          >
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 relative">
      {/* Lời chào trên màn hình Desktop */}
      <div className="hidden md:flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            Chào buổi sáng, {mounted && user?.name ? user.name : "Bạn"}!
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Hôm nay tình hình tài chính của gia đình bạn thế nào?
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={() => {
              setModalType("income");
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowUpRight size={18} weight="bold" />
            Thêm Thu
          </button>
          <button
            onClick={() => {
              setModalType("expense");
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 rounded-xl font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowDownRight size={18} weight="bold" />
            Thêm Chi
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {/* CẢNH BÁO NGÂN SÁCH (WARNING CARDS) */}
          {data?.alertBudgets?.length > 0 && (
            <div className="flex flex-col gap-3 mb-6">
              {data.alertBudgets.map((alert: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900 rounded-xl p-4 flex items-center justify-between shadow-sm animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                      <WarningCircle size={24} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-red-800 dark:text-red-200 text-sm font-bold uppercase tracking-widest">
                        Cảnh báo ngân sách
                      </p>
                      <p className="text-red-600 dark:text-red-300 text-base font-black">
                        {alert.categoryId?.name}
                      </p>

                      {user?.role === "member" ? (
                        <div className="mt-2 w-full min-w-[200px]">
                          <div className="flex justify-between text-[10px] font-bold text-red-600 dark:text-red-400 mb-1 tracking-tighter">
                            <span>TIẾN ĐỘ CHI TIÊU</span>
                            <span>{alert.percentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-red-200 dark:bg-red-900/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(alert.percentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-red-600 dark:text-red-300 text-sm">
                          Đã chi {formatCurrency(alert.spentAmount)} /{" "}
                          {formatCurrency(alert.limitAmount)} (
                          {alert.percentage}
                          %)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-xs font-bold text-red-700 bg-red-200 px-3 py-1 rounded-md">
                      {user?.role === "member"
                        ? `Mức cảnh báo ${alert.threshold}%`
                        : `Vượt mức ${alert.threshold}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HÀNG CÁC THẺ (TOP SUMMARY CARDS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Số dư tổng (To nhất) */}
            <div className="md:col-span-2 bg-linear-to-br from-green-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-green-500/20 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Wallet size={120} weight="duotone" />
              </div>
              <div>
                <p className="text-green-100 font-bold text-[11px] uppercase tracking-widest opacity-80 pl-1">
                  Số dư tài sản
                </p>
                <h3 className="text-4xl md:text-6xl font-black mt-2 tracking-tighter">
                  {formatCurrency(data?.totalBalance ?? 0)}
                </h3>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <div className="bg-white/20 rounded-lg px-3 py-2 flex-1 max-w-[200px]">
                  <p className="text-xs text-green-100">
                    Thu nhập tháng {new Date().getMonth() + 1}
                  </p>
                  <div className="flex items-center gap-1 mt-1 font-bold text-sm">
                    <ArrowUpRight size={16} weight="bold" /> +
                    {formatCurrency(data?.monthIncome ?? 0)}
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-2 flex-1 max-w-[200px]">
                  <p className="text-xs text-green-100">
                    Chi tiêu tháng {new Date().getMonth() + 1}
                  </p>
                  <div className="flex items-center gap-1 mt-1 font-semibold text-sm text-red-100">
                    <ArrowDownRight size={16} /> -
                    {formatCurrency(data?.monthExpense ?? 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Ví chung Gia đình */}
            <div className="bg-white dark:bg-[#122017] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users size={24} weight="fill" />
                </div>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-md">
                  An tâm
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-6 pl-1">
                {user?.role === "member" ? "Ví của tôi" : "Ví chung Gia đình"}
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                {formatCurrency(data?.totalBalance ?? 0)}
              </h3>
            </div>
          </div>

          {/* CỘT NỘI DUNG DƯỚI (CHART & LỊCH SỬ GIAO DỊCH) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            {/* BIỂU ĐỒ BẰNG RECHARTS */}
            <div className="bg-white dark:bg-[#122017] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4 tracking-tight">
                Phân bổ chi tiêu (Tháng {new Date().getMonth() + 1})
              </h3>

              {data?.categoryAllocation?.length > 0 ? (
                <>
                  <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryAllocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="totalAmount"
                          stroke="none"
                        >
                          {data.categoryAllocation.map(
                            (entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.color || COLORS[index % COLORS.length]
                                }
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Chú thích màu sắc */}
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-medium">
                    {data.categoryAllocation.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              item.color || COLORS[i % COLORS.length],
                          }}
                        ></div>
                        {item.name} (
                        {Math.round(
                          (item.totalAmount / data.monthExpense) * 100,
                        )}
                        %)
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-slate-400">
                  Chưa có chi phí nào trong tháng này.
                </div>
              )}
            </div>

            {/* LỊCH SỬ GIAO DỊCH (TRANSACTIONS) */}
            <div className="bg-white dark:bg-[#122017] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                  Giao dịch gần đây
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px]">
                {data?.recentTransactions?.length > 0 ? (
                  data.recentTransactions.map((tx: any, idx: number) => {
                    const isIncome = tx._type === "income";
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                            style={{
                              backgroundColor: `${tx.categoryID?.color || "#8b5cf6"}1A`,
                              color: tx.categoryID?.color || "#8b5cf6",
                            }}
                          >
                            {(() => {
                              const iconName = tx.categoryID?.icon;
                              const IconComponent =
                                iconName && (PhosphorIcons as any)[iconName]
                                  ? (PhosphorIcons as any)[iconName]
                                  : PhosphorIcons.Star;
                              return (
                                <IconComponent size={24} weight="duotone" />
                              );
                            })()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate w-32 md:w-auto">
                              {tx.description ||
                                tx.categoryID?.name ||
                                "Giao dịch"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {dayjs(tx.date).format("DD/MM/YYYY")}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`font-bold shrink-0 ${isIncome ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
                        >
                          {isIncome ? "+ " : "- "}
                          {formatCurrency(tx.amount)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-500 text-center text-sm py-4">
                    Chưa có giao dịch nào
                  </div>
                )}
              </div>
            </div>
          </div>


        </>
      )}

      {/* MODAL THÊM GIAO DỊCH NHANH */}
      <AddTransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        categories={categories}
        type={modalType}
      />
    </div>
  );
}
