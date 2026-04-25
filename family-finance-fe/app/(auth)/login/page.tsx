"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseMessage, isError } from "@/lib/helper";
import { useAuthStore } from "@/store/auth.store";
import {
  GiaKeLogo,
  InputField,
  SubmitBtn,
  ErrorAlert,
  IconMail,
  IconLock,
} from "@/components/ui/shared";
import { loginAction } from "@/lib/action";

const LoginPage = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await loginAction(email.trim().toLowerCase(), password);

      if (isError(res) || !res.access_token) {
        setError(parseMessage(res.message));
        return;
      }
      // Lưu vào Zustand store
      setAuth(res.user!, res.access_token);
      // Redirect Admin vs User
      router.push(
        res.user?.sysRole === "admin"
          ? "/admin"
          : res.user?.spaceId
            ? "/dashboard"
            : "/space",
      );
      router.refresh();
    } catch {
      setError("Không thể kết nối tới server. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#0f1a14] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
        {/* ── Cột trái: Hero (chỉ desktop)  */}
        <LeftHero />

        {/* ── Cột phải: Form  */}
        <div className="bg-white dark:bg-[#122017] flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-14">
          {/* Logo — chỉ mobile */}
          <div className="flex lg:hidden justify-center mb-8">
            <GiaKeLogo size="lg" />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              Chào mừng trở lại
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1.5">
              Đăng nhập để quản lý tài chính gia đình
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Email"
              type="email"
              icon={<IconMail />}
              placeholder="nguyen@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              autoFocus
            />

            <InputField
              label="Mật khẩu"
              icon={<IconLock />}
              isPassword
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="current-password"
            />

            {/* Quên mật khẩu */}
            <div className="flex justify-end -mt-1">
              <Link
                href="/change-password"
                className="text-xs text-[#22C55E] hover:text-green-600 font-medium transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {error && <ErrorAlert message={error} />}

            <SubmitBtn
              loading={loading}
              label="Đăng nhập"
              loadLabel="Đang đăng nhập..."
            />
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">hoặc</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-[#22C55E] hover:text-green-600 font-bold transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>

          {/* Bottom bar mobile */}
          <div className="flex lg:hidden justify-center mt-8">
            <div className="w-28 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

const LeftHero = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-[#22C55E] p-12 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-black/10" />
      <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-white/5" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        </div>
        <span className="text-white text-xl font-bold">Gia Kế</span>
      </div>

      {/* Phone mockup */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-48 h-80 bg-white/15 backdrop-blur-sm rounded-3xl border border-white/30 flex flex-col p-4 gap-3 shadow-xl">
          <div className="h-2 w-12 bg-white/40 rounded-full mx-auto" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-white/70 text-xs mb-1">
                Tổng chi tháng này
              </div>
              <div className="text-white text-lg font-bold">3.200.000đ</div>
              <div className="h-1.5 bg-white/20 rounded-full mt-2">
                <div className="h-full w-3/5 bg-white/70 rounded-full" />
              </div>
              <div className="text-white/60 text-xs mt-1">64% ngân sách</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["🍜", "Ăn uống", "1.2M"],
                ["🚗", "Đi lại", "450K"],
              ].map(([icon, label, val]) => (
                <div key={label} className="bg-white/20 rounded-xl p-2">
                  <div className="text-base">{icon}</div>
                  <div className="text-white/60 text-[10px]">{label}</div>
                  <div className="text-white text-xs font-semibold">{val}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/10 rounded-xl p-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-sm">
                👨
              </div>
              <div>
                <div className="text-white/60 text-[10px]">Bố vừa thêm</div>
                <div className="text-white text-[10px] font-medium">
                  Chi 320.000đ · Ăn uống
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-white text-3xl font-black leading-tight tracking-tighter">
            Quản lý tài chính
            <br />
            gia đình thông minh
          </h2>
          <p className="text-white/70 text-sm mt-2">
            Minh bạch từng khoản chi, gắn kết cả nhà
          </p>
        </div>
      </div>

      <div className="relative z-10 flex justify-center gap-1.5">
        <div className="w-6 h-1.5 bg-white rounded-full" />
        <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
        <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
      </div>
    </div>
  );
};
export default LoginPage;
