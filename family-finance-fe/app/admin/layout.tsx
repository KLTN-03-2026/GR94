"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  ListDashes, 
  SignOut, 
  ShieldCheck 
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/auth.store";
import { logoutAction } from "@/lib/action";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { clear, user } = useAuthStore();

  const handleLogout = async () => {
    // Xóa state trong Zustand
    clear(); 
    // Quan trọng: Phải xóa Cookie (HttpOnly) bằng Server Action
    await logoutAction();
    // Đẩy về login
    router.push("/login");
  };

  const menu = [
    {
      label: "Người dùng",
      href: "/admin/users",
      icon: <Users weight="fill" className="text-xl" />,
    },
    {
      label: "Danh mục HT",
      href: "/admin/categories",
      icon: <ListDashes weight="fill" className="text-xl" />,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8faf9] dark:bg-[#0f1a14] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#122017] flex flex-col hide-scrollbar">
        {/* Logo / Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
            <ShieldCheck weight="fill" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-[11px] uppercase tracking-widest text-slate-800 dark:text-slate-100">Gia Kế Admin</h1>
            <p className="text-[10px] font-medium text-slate-500">System Administrator</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-2 mb-2 uppercase tracking-widest">
            Quản lý chung
          </div>
          {menu.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold ${
                  isActive
                    ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <SignOut weight="bold" size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-[#122017] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
            {menu.find(m => pathname.startsWith(m.href))?.label || "Admin Dashboard"}
          </h2>
          {/* User profile small */}
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.name || 'Admin'}</div>
               <div className="text-xs text-slate-500">{user?.email}</div>
             </div>
             <img src={user?.avatar || "https://i.pinimg.com/736x/20/ef/6b/20ef6b554ea249790281e6677abc4160.jpg"} className="w-9 h-9 rounded-full ring-2 ring-slate-100 object-cover" alt="avatar" />
          </div>
        </header>

        {/* Main scrollable area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
