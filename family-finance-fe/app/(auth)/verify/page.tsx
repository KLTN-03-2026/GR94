"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { parseMessage, isError } from "@/lib/helper";
import {
  GiaKeLogo,
  SubmitBtn,
  ErrorAlert,
  SuccessAlert,
  IconSpinner,
} from "@/components/ui/shared";
import { resendCodeAction, verifyAccountAction } from "@/lib/action";

const VerifyPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);

  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto verify khi đủ 6 số
  useEffect(() => {
    if (digits.every(Boolean)) handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  const handleChange = useCallback((i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    setError("");
    if (v && i < 5) refs.current[i + 1]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (i: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace") {
        if (!digits[i] && i > 0) {
          setDigits((prev) => {
            const n = [...prev];
            n[i - 1] = "";
            return n;
          });
          refs.current[i - 1]?.focus();
        } else {
          setDigits((prev) => {
            const n = [...prev];
            n[i] = "";
            return n;
          });
        }
      }
      if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
      if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
    },
    [digits],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    setDigits((prev) => {
      const next = [...prev];
      text.split("").forEach((c, i) => {
        next[i] = c;
      });
      return next;
    });
    refs.current[Math.min(text.length, 5)]?.focus();
  }, []);

  async function handleVerify() {
    const code = digits.join("");
    if (code.length < 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }
    if (!email) {
      setError("Không tìm thấy email. Vui lòng đăng ký lại.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await verifyAccountAction(email, code);
      if (isError(res)) {
        setError(parseMessage(res.message));
        setDigits(Array(6).fill(""));
        refs.current[0]?.focus();
        return;
      }
      router.push("/login?verified=1");
    } catch {
      setError("Không thể kết nối tới server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const res = await resendCodeAction(email);
      if (isError(res)) {
        setError(parseMessage(res.message));
        return;
      }
      setSuccess("Đã gửi lại mã xác thực!");
      setCountdown(60);
      setDigits(Array(6).fill(""));
      setTimeout(() => setSuccess(""), 4000);
      refs.current[0]?.focus();
    } catch {
      setError("Không thể gửi lại. Thử lại sau.");
    } finally {
      setResending(false);
    }
  }

  const code = digits.join("");
  const isFilled = digits.every(Boolean);

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#0f1a14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-[#122017] rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-[#22C55E]" />

          <div className="px-8 py-10 sm:px-12">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <GiaKeLogo />
            </div>

            {/* Mail icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#22C55E]/10 dark:bg-[#22C55E]/20 rounded-2xl flex items-center justify-center">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 13-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 13" />
                  <path d="M2 9.5V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9.5" />
                  <path d="M22 9.5 12 15 2 9.5" />
                  <path d="M2 9.5 12 4l10 5.5" />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Xác thực email
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                Chúng tôi đã gửi mã 6 số tới
                <br />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {email || "email của bạn"}
                </span>
              </p>
            </div>

            {/* OTP inputs */}
            <div
              className="flex justify-center gap-2 sm:gap-3 mb-5"
              onPaste={handlePaste}
            >
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`
                    w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold rounded-xl border-2
                    bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white
                    outline-none transition-all select-none
                    ${
                      d
                        ? "border-[#22C55E] bg-[#22C55E]/5 dark:bg-[#22C55E]/10 text-[#22C55E]"
                        : "border-slate-200 dark:border-slate-700 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
                    }
                    ${loading ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                  disabled={loading}
                />
              ))}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-5">
              {digits.map((d, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${d ? "w-5 bg-[#22C55E]" : "w-2 bg-slate-200 dark:bg-slate-700"}`}
                />
              ))}
            </div>

            {error && (
              <div className="mb-4">
                <ErrorAlert message={error} />
              </div>
            )}
            {success && (
              <div className="mb-4">
                <SuccessAlert message={success} />
              </div>
            )}

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={loading || !isFilled}
              className="h-12 w-full rounded-xl bg-[#22C55E] hover:bg-green-500 active:scale-[0.98]
                         text-white font-semibold text-sm tracking-wide
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all shadow-lg shadow-green-500/25
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <IconSpinner className="w-4 h-4" />
                  Đang xác thực...
                </>
              ) : (
                "Xác thực tài khoản"
              )}
            </button>

            {/* Resend */}
            <div className="text-center mt-5 space-y-1">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Không nhận được mã?
              </p>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || resending}
                className={`text-sm font-semibold transition-colors inline-flex items-center gap-1 ${
                  countdown > 0 || resending
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-[#22C55E] hover:text-green-600 cursor-pointer"
                }`}
              >
                {resending ? (
                  <>
                    <IconSpinner className="w-3.5 h-3.5" /> Đang gửi...
                  </>
                ) : countdown > 0 ? (
                  `Gửi lại sau ${countdown}s`
                ) : (
                  "Gửi lại mã"
                )}
              </button>
            </div>

            {/* Back */}
            <div className="text-center mt-4">
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                ← Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="flex justify-center mt-5">
          <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
export default VerifyPage;
