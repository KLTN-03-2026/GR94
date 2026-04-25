"use client";
import { useEffect, useState } from "react";
import { getUsersAdminAction } from "@/lib/action";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersAdminAction();
      if (res.data?.result) {
        setUsers(res.data.result);
      } else if ((res as any).result) {
        setUsers((res as any).result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#122017] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight uppercase">
          Danh sách thành viên
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Người dùng</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Vai trò HT</th>
              <th className="px-4 py-3">Ngày tham gia</th>
              <th className="px-4 py-3 rounded-r-lg">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Đang tải thông tin...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Chưa có người dùng nào
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-4 flex items-center gap-3">
                    <img
                      src={
                        u.avatar ||
                        "https://i.pinimg.com/736x/20/ef/6b/20ef6b554ea249790281e6677abc4160.jpg"
                      }
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                      alt="avatar"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {u.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                    {u.accountId?.email || "Không rõ"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${
                        u.accountId?.sysRole === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {u.accountId?.sysRole === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500 text-xs">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3">
                      <button className="text-red-500 hover:text-red-600 text-[11px] font-bold uppercase tracking-widest hover:underline transition-colors">
                        Khóa TK
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
