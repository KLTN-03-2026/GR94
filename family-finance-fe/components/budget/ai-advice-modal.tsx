"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getAIAdviceAction } from "@/lib/action";
import {
  Sparkle,
  Robot,
  Warning,
  Info,
  Quotes,
  CaretRight,
} from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AiAdviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string;
  categoryName: string;
}

export function AiAdviceModal({
  open,
  onOpenChange,
  budgetId,
  categoryName,
}: AiAdviceModalProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ai-advice", budgetId],
    queryFn: async () => {
      const res = await getAIAdviceAction(budgetId);
      if (res.statusCode !== 200) throw new Error(Array.isArray(res.message) ? res.message[0] : res.message);
      return res.data;
    },
    enabled: open && !!budgetId,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  const adviceContent = data?.advice || "";
  const stats = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#122017] border-0 shadow-2xl rounded-3xl overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white relative overflow-hidden">
          {/* Subtle patterns */}
          <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-10">
            <Sparkle size={120} weight="fill" />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <Robot size={32} weight="duotone" className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tighter uppercase mb-1">
                Gợi ý từ Trợ lý AI
              </DialogTitle>
              <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2">
                Ngân sách:{" "}
                <span className="bg-white/20 px-2 py-0.5 rounded-full">
                  {categoryName}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-0">
          <ScrollArea className="h-[400px] sm:h-[550px] w-full p-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-slate-500 italic">
                    Đang phân tích dữ liệu chi tiêu của bạn...
                  </span>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-slate-100 dark:bg-slate-800" />
                  <Skeleton className="h-4 w-[90%] bg-slate-100 dark:bg-slate-800" />
                  <Skeleton className="h-4 w-[95%] bg-slate-100 dark:bg-slate-800" />
                  <Skeleton className="h-4 w-[40%] bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="pt-6 space-y-3">
                  <Skeleton className="h-4 w-[85%] bg-slate-100 dark:bg-slate-800" />
                  <Skeleton className="h-4 w-full bg-slate-100 dark:bg-slate-800" />
                  <Skeleton className="h-4 w-[70%] bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <Warning size={32} weight="bold" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-2">
                  Đã có lỗi xảy ra
                </h3>
                <p className="text-sm text-slate-500 max-w-xs">
                  Không thể kết nối với AI ngay lúc này. Vui lòng kiểm tra lại
                  kết nối mạng.
                </p>
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none pb-12">
                {/* Stats Summary Card */}
                {stats && (
                  <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono tracking-tighter">
                        Hiện trạng tháng này
                      </div>
                      <div className="text-lg font-black tracking-tighter text-slate-900 dark:text-slate-100">
                        {stats.percentage.toFixed(1)}%{" "}
                        <span className="text-sm font-medium text-slate-500">
                          đã dùng
                        </span>
                      </div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-700 mx-4" />
                    <div className="text-right space-y-1 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono tracking-tighter">
                        Hạn mức
                      </div>
                      <div className="font-black text-xl text-green-600 dark:text-green-400 tracking-tighter">
                        {stats.limitAmount.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute -left-2 top-0 text-green-200 dark:text-green-900/40 transform -translate-x-full">
                    <Quotes size={48} weight="fill" />
                  </div>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => (
                          <h3
                            className="text-lg font-black tracking-tighter uppercase text-slate-900 dark:text-slate-100 mt-6 mb-3 flex items-center gap-2"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h4
                            className="text-md font-bold text-slate-800 dark:text-slate-200 mt-5 mb-2 border-l-4 border-green-500 pl-3"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h5
                            className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2 italic"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-4 text-sm leading-6" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            className="flex gap-3 items-start mb-4 bg-white dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow"
                            {...props}
                          >
                            <div className="mt-1 shrink-0 p-1 bg-green-50 dark:bg-green-900/40 rounded-lg text-green-600 dark:text-green-400">
                              <CaretRight size={12} weight="bold" />
                            </div>
                            <div className="text-sm leading-relaxed">
                              {props.children}
                            </div>
                          </li>
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-none p-0 mt-2" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-black text-slate-900 dark:text-white bg-green-50 dark:bg-green-900/20 px-1 rounded"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {adviceContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            Đã hiểu
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
