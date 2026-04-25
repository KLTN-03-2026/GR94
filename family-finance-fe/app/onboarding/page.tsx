"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// ─── Animated number counter ──────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(t);
      } else setVal(start);
    }, 30);
    return () => clearInterval(t);
  }, [to]);
  return (
    <>
      {val.toLocaleString("vi-VN")}
      {suffix}
    </>
  );
}

const OnboardingPage = () => {
  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 antialiased flex flex-col md:flex-row w-full overflow-hidden bg-[#f6f8f7] dark:bg-[#0f1a14]">
      {/* ── Left Panel - Hero/Illustration ───────────────── */}
      <div className="relative w-full md:w-1/2 lg:w-[45%] flex flex-col items-center justify-center bg-[#f6f8f7] dark:bg-[#122017] px-6 pt-6 pb-12 md:p-12 min-h-[45vh] md:min-h-screen flex-shrink-0 xl:p-20">
        {/* Top bar */}
        <div className="flex items-center w-full justify-between md:absolute md:top-8 md:px-12 xl:px-20 z-20">
          <h2 className="text-slate-900 dark:text-slate-100 text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[#22C55E]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="21" />
            </svg>
            Gia Kế
          </h2>
          <button className="w-10 h-10 flex items-center justify-end md:hidden">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
        </div>

        {/* Hero illustration */}
        <div className="flex w-full items-center justify-center mt-6 md:mt-0 flex-1 z-10 max-w-[320px] md:max-w-[420px] lg:max-w-[500px]">
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-[#22C55E]/10 flex items-center justify-center">
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#22C55E33,_transparent_70%)]" />

            {/* Main icon */}
            <div className="z-10 flex flex-col items-center">
              <div className="w-36 h-36 md:w-48 md:h-48 bg-[#22C55E]/20 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-[80px] h-[80px] md:w-[110px] md:h-[110px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>

            {/* Floating card — top right */}
            <div className="absolute top-5 right-5 md:top-8 md:right-8 bg-white/90 dark:bg-[#122017]/90 backdrop-blur-sm rounded-2xl shadow-lg px-3 py-2 md:px-4 md:py-3 border border-[#22C55E]/20 transition-transform hover:-translate-y-1">
              <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">
                Tiết kiệm tháng này
              </div>
              <div className="text-sm md:text-base font-bold text-[#22C55E]">
                +<Counter to={2500000} />đ
              </div>
            </div>

            {/* Floating card — bottom left */}
            <div className="absolute bottom-6 left-5 md:bottom-8 md:left-8 bg-white/90 dark:bg-[#122017]/90 backdrop-blur-sm rounded-2xl shadow-lg px-3 py-2 md:px-4 md:py-3 border border-[#22C55E]/20 flex items-center gap-2 transition-transform hover:-translate-y-1">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#22C55E]/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel - Content ───────────────────────── */}
      <div className="flex-1 flex flex-col px-8 pt-10 pb-6 md:p-16 xl:p-24 bg-white dark:bg-[#0f1a14] rounded-t-[3rem] md:rounded-none -mt-8 md:mt-0 z-10 md:z-auto shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none min-h-[50vh] md:min-h-screen overflow-y-auto relative">
        <div className="flex-1 flex flex-col justify-center max-w-[400px] md:max-w-md lg:max-w-lg mx-auto w-full">
          <h1 className="text-slate-900 dark:text-slate-100 text-[32px] md:text-5xl lg:text-5xl font-black leading-tight text-center md:text-left tracking-tighter">
            Chào mừng tới <span className="text-[#22C55E]">Gia Kế</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed text-center md:text-left mt-3 mb-8 md:mb-10 px-2 md:px-0">
            Quản lý tài chính gia đình thông minh,
            <br className="hidden md:block" /> minh bạch và gắn kết.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10 md:mb-12">
            {[
              { num: 5000, suffix: "+", label: "Gia đình" },
              { num: 98, suffix: "%", label: "Hài lòng" },
              { num: 4, suffix: "X", label: "Tiết kiệm hơn" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-50 dark:bg-[#1a251f] md:bg-white md:dark:bg-[#122017] rounded-2xl p-3 md:p-4 text-center shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:-translate-y-1"
              >
                <div className="text-lg md:text-2xl font-bold text-[#22C55E]">
                  <Counter to={s.num} suffix={s.suffix} />
                </div>
                <div className="text-[11px] md:text-[11px] text-slate-500 dark:text-slate-400 mt-1 md:mt-1.5 font-bold uppercase tracking-widest">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 md:gap-4 mt-auto md:mt-0">
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-2xl h-14 md:h-16 px-5
                         bg-[#22C55E] text-white text-lg md:text-xl font-bold tracking-wide
                         transition-all hover:bg-[#1ea850] active:scale-[0.98] shadow-lg shadow-[#22C55E]/30"
            >
              Bắt đầu ngay
            </Link>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-2xl h-14 md:h-16 px-5
                         bg-transparent text-slate-500 dark:text-slate-400 text-base md:text-lg font-semibold
                         transition-all hover:bg-slate-50 hover:dark:bg-slate-800/50 active:scale-[0.98]"
            >
              Bạn đã có tài khoản?{" "}
              <span className="text-[#22C55E] ml-1.5 hover:underline decoration-2 underline-offset-4">
                Đăng nhập
              </span>
            </Link>
          </div>

          {/* Decorative elements for desktop */}
          <div className="hidden md:block absolute bottom-0 right-0 w-64 h-64 bg-[#22C55E]/5 rounded-tl-full -z-10 pointer-events-none blur-3xl" />
        </div>

        {/* ── Bottom bar (mobile only) ────────────────── */}
        <div className="pb-4 mt-8 flex justify-center flex-shrink-0 md:hidden">
          <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
