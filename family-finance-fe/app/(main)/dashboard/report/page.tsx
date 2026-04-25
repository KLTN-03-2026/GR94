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
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummaryAction } from "@/lib/action";

const ReportPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await getDashboardSummaryAction();
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
          Báo cáo quản lý
        </h2>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Phân tích xu hướng tài chính của gia đình bạn qua các giai đoạn.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#122017] border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6 tracking-tight">
            Xu hướng Thu / Chi (6 Tháng gần nhất)
          </h3>
          <div className="h-[400px] w-full">
            {data?.trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.trend}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
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
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0}
                      />
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
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#f43f5e"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    tickFormatter={(val) => {
                      if (val >= 1000000)
                        return `${(val / 1000000).toFixed(1)}M`;
                      if (val >= 1000) return `${val / 1000}k`;
                      return String(val);
                    }}
                  />
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Thu Nhập"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Chi Tiêu"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Chưa có đủ dữ liệu để vẽ biểu đồ
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;