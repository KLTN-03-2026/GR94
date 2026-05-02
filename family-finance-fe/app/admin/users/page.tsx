"use client";
import { useEffect, useState } from "react";
import { getUsersAdminAction, toggleLockUserAction } from "@/lib/action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isToggling, setIsToggling] = useState(false);

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

  const openToggleDialog = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const confirmToggleLock = async () => {
    if (!selectedUser) return;
    setIsToggling(true);
    try {
      const res = await toggleLockUserAction(selectedUser._id);
      
      if (res && (res.error || res.statusCode === 500 || res.statusCode === 400)) {
        toast.error(res?.message || "Có lỗi xảy ra khi xử lý");
      } else {
        toast.success(selectedUser.accountId?.is_locked ? "Đã mở khóa tài khoản thành công" : "Đã khóa tài khoản thành công");
        fetchUsers();
        setIsDialogOpen(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsToggling(false);
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
                      {u.accountId?.sysRole !== "admin" && (
                        <button 
                          onClick={() => openToggleDialog(u)}
                          className={`${u.accountId?.is_locked ? "text-green-500 hover:text-green-600" : "text-red-500 hover:text-red-600"} text-[11px] font-bold uppercase tracking-widest hover:underline transition-colors`}
                        >
                          {u.accountId?.is_locked ? "Mở Khóa" : "Khóa TK"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md !rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedUser?.accountId?.is_locked ? "Xác nhận mở khóa" : "Xác nhận khóa tài khoản"}
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {selectedUser?.accountId?.is_locked 
                ? `Bạn có chắc chắn muốn mở khóa tài khoản của người dùng ${selectedUser?.name}? Họ sẽ có thể đăng nhập lại vào hệ thống bình thường.`
                : `Bạn có chắc chắn muốn khóa tài khoản của người dùng ${selectedUser?.name}? Họ sẽ bị đăng xuất và không thể đăng nhập cho đến khi được mở khóa.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isToggling} className="rounded-xl">
              Hủy
            </Button>
            <Button 
              variant={selectedUser?.accountId?.is_locked ? "default" : "destructive"} 
              onClick={confirmToggleLock} 
              disabled={isToggling}
              className="rounded-xl"
            >
              {isToggling ? "Đang xử lý..." : (selectedUser?.accountId?.is_locked ? "Mở khóa ngay" : "Khóa tài khoản")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
