"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, Trash } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotificationsAction, markNotificationAsReadAction, deleteNotificationAction } from "@/lib/action";
import { useAuthStore } from "@/store/auth.store";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifData, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await getNotificationsAction(1, 20); // Fetch top 20
      return res?.data?.data || [];
    },
    refetchInterval: 30000, // Fetch mỗi 30 giây
    refetchOnWindowFocus: true, // Fetch lại khi user quay lại tab
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await markNotificationAsReadAction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteNotificationAction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notifData || [];
  
  // Lọc số thông báo chưa đọc
  const unreadCount = notifications.filter(
    (n: any) => !n.isRead || (user?._id && !n.isRead.includes(user._id))
  ).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string, isReadByMe: boolean) => {
    if (!isReadByMe) {
      markAsReadMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/60" ref={containerRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const newState = !isOpen;
          setIsOpen(newState);
          // Fetch dữ liệu mới nhất ngay khi mở chuông
          if (newState) refetch();
        }}
        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors w-full text-left"
      >
        <div className="flex items-center gap-3">
          <Bell size={20} />
          <span>Thông báo</span>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Expanded Danh sách thông báo */}
      {isOpen && (
        <div className="max-h-64 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/60">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-slate-500 flex flex-col items-center">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={20} className="text-slate-400" />
              </div>
              <p className="text-xs">Không có thông báo mới!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.map((notif: any) => {
                const isReadByMe = user?._id
                  ? notif.isRead?.includes(user._id)
                  : false;

                return (
                  <div
                    key={notif._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif._id, isReadByMe);
                    }}
                    className={`p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group ${
                      !isReadByMe ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    {!isReadByMe && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>
                    )}

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0 flex items-center justify-center text-green-600 dark:text-green-400 text-xs">
                        {notif.type === "WARNING" ? "⚠️" : "📝"}
                      </div>
                      <div className="flex-1 min-w-0 pr-6 relative">
                        <h4
                          className={`text-xs font-medium text-slate-900 dark:text-slate-100 mb-0.5 leading-tight pr-4 ${
                            !isReadByMe ? "font-semibold" : ""
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="text-[9px] text-slate-400 mt-1 font-medium">
                          {dayjs(notif.createdAt).fromNow()}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif._id);
                          }}
                          className="absolute top-0 right-0 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          title="Xóa thông báo"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
