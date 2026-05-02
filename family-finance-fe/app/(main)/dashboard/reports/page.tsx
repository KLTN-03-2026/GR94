"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendUp,
  TrendDown,
  Wallet,
  ChartLineUp,
  ChartPieSlice,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummaryAction } from "@/lib/action";
import dayjs from "dayjs";

const ReportPage = () => {
  const [selectedMonth, setSelectedMonth] = React.useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = React.useState(dayjs().year());

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-report", selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await getDashboardSummaryAction(selectedMonth, selectedYear);
      return res?.data || null;
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#f43f5e",
    "#8b5cf6",
    "#06b6d4",
  ];

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => dayjs().year() - i);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Đang tổng hợp báo cáo...
        </p>
      </div>
    );
  }

  const savings = (data?.monthIncome || 0) - (data?.monthExpense || 0);
  const savingsRate =
    data?.monthIncome > 0 ? Math.round((savings / data?.monthIncome) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-2 uppercase tracking-wider">
            <ChartLineUp weight="bold" />
            <span>Phân tích tài chính</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Báo cáo tháng {selectedMonth}/{selectedYear}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Cái nhìn toàn diện về dòng tiền và thói quen chi tiêu của gia đình.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 px-3">
            <Calendar size={20} className="text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
          <div className="w-px h-6 bg-slate-100 dark:bg-slate-700"></div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent px-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#122017] p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <TrendUp size={80} weight="fill" className="text-blue-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
              <ArrowUpRight size={24} weight="bold" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">
              Tổng Thu Nhập
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {formatCurrency(data?.monthIncome || 0)}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/10 inline-block px-2 py-1 rounded-md">
            +Tháng này
          </div>
        </div>

        <div className="bg-white dark:bg-[#122017] p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <TrendDown size={80} weight="fill" className="text-rose-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400">
              <ArrowDownRight size={24} weight="bold" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">
              Tổng Chi Tiêu
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {formatCurrency(data?.monthExpense || 0)}
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 inline-block px-2 py-1 rounded-md">
            -Tháng này
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-500 p-6 rounded-2xl shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
            <Wallet size={80} weight="fill" className="text-white" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg text-white">
              <ChartPieSlice size={24} weight="bold" />
            </div>
            <span className="text-sm font-bold text-emerald-50 uppercase">
              Tích lũy ròng
            </span>
          </div>
          <div className="text-2xl font-black text-white mb-1">
            {formatCurrency(savings)}
          </div>
          <div className="text-xs text-white font-bold bg-white/20 inline-block px-2 py-1 rounded-md">
            Tỷ lệ: {savingsRate}%
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Area Chart */}
        <div className="bg-white dark:bg-[#122017] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
              Biến động 6 tháng qua
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold text-slate-500">Thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-xs font-bold text-slate-500">Chi</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            {data?.trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.trend}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorIncome"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorExpense"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#f43f5e"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(0)}M`
                        : `${val / 1000}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      padding: "12px",
                    }}
                    itemStyle={{ fontWeight: "bold", fontSize: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Thu nhập"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Chi tiêu"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                Chưa đủ dữ liệu xu hướng
              </div>
            )}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white dark:bg-[#122017] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-8 tracking-tight">
            Phân bổ chi tiêu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full max-h-[350px]">
            <div className="h-[280px]">
              {data?.categoryAllocation?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryAllocation}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="totalAmount"
                      nameKey="name"
                    >
                      {data.categoryAllocation.map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                  Không có dữ liệu chi tiêu
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-3 overflow-y-auto pr-2">
              {data?.categoryAllocation
                ?.slice(0, 5)
                .map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between group cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            item.color || COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {Math.round((item.totalAmount / data.monthExpense) * 100)}
                      %
                    </span>
                  </div>
                ))}
              {data?.categoryAllocation?.length > 5 && (
                <p className="text-xs text-slate-400 font-medium text-center pt-2">
                  Và {data.categoryAllocation.length - 5} danh mục khác
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-500/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30">
            <ChartPieSlice size={32} weight="bold" />
          </div>
          <div>
            <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-400 mb-2">
              Tóm lược thông minh
            </h4>
            <p className="text-emerald-800/70 dark:text-emerald-400/70 leading-relaxed font-medium">
              Tháng này bạn đã tiết kiệm được{" "}
              <span className="font-black text-emerald-600 dark:text-emerald-300 underline decoration-2 underline-offset-4">
                {formatCurrency(savings)}
              </span>
              .
              {savingsRate > 20
                ? " Đây là một tỷ lệ tiết kiệm rất tốt! Hãy tiếp tục duy trì thói quen quản lý chi tiêu kỷ luật này."
                : savingsRate > 0
                  ? " Bạn đang đi đúng hướng, nhưng có thể tối ưu thêm các khoản chi tiêu không cần thiết để tăng tỷ lệ tích lũy."
                  : " Chi tiêu của bạn đang vượt quá hoặc xấp xỉ thu nhập. Hãy kiểm tra lại các danh mục chiếm tỷ trọng lớn nhất."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
