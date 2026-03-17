"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { parseMessage, isError } from "@/lib/helper";
import {
  GiaKeLogo,
  InputField,
  SubmitBtn,
  ErrorAlert,
  SuccessAlert,
  IconLock,
  IconCheck,
} from "@/components/ui/shared";
import { changePasswordAction } from "@/lib/action";

// Password strength rules
const pwdRules = (p: string) => [
  { label: "Ít nhất 6 ký tự", ok: p.length >= 6 },
  { label: "Có chữ và số", ok: /[a-zA-Z]/.test(p) && /[0-9]/.test(p) },
];

export default function ChangePasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrors((prev) => ({ ...prev, [k]: "" }));
      setApiError("");
      setSuccess("");
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.currentPassword)
      e.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!form.newPassword) e.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (form.newPassword.length < 6)
      e.newPassword = "Mật khẩu mới ít nhất 6 ký tự";
    else if (form.newPassword === form.currentPassword)
      e.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    if (!form.confirmPassword)
      e.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    else if (form.confirmPassword !== form.newPassword)
      e.confirmPassword = "Mật khẩu xác nhận không khớp";
    return e;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      const res = await changePasswordAction(
        form.currentPassword,
        form.newPassword,
      );

      if (isError(res)) {
        setApiError(parseMessage(res.message));
        return;
      }

      setSuccess("Đổi mật khẩu thành công!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // Redirect về login sau 2 giây
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setApiError("Không thể kết nối tới server. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  const rules = pwdRules(form.newPassword);

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

            {/* Icon */}
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <circle cx="12" cy="16" r="1" fill="#22C55E" />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Đổi mật khẩu
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Nhập mật khẩu hiện tại và mật khẩu mới
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                label="Mật khẩu hiện tại"
                icon={<IconLock />}
                isPassword
                placeholder="Nhập mật khẩu hiện tại"
                value={form.currentPassword}
                onChange={set("currentPassword")}
                error={errors.currentPassword}
                autoFocus
              />

              <div>
                <InputField
                  label="Mật khẩu mới"
                  icon={<IconLock />}
                  isPassword
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.newPassword}
                  onChange={set("newPassword")}
                  error={errors.newPassword}
                  autoComplete="new-password"
                />
                {/* Strength indicator */}
                {form.newPassword && (
                  <div className="flex gap-4 mt-2 pl-1">
                    {rules.map((r) => (
                      <div
                        key={r.label}
                        className={`flex items-center gap-1 text-xs transition-colors ${r.ok ? "text-[#22C55E]" : "text-slate-400"}`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${r.ok ? "bg-[#22C55E] text-white" : "bg-slate-200 dark:bg-slate-700"}`}
                        >
                          {r.ok && <IconCheck />}
                        </span>
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <InputField
                label="Xác nhận mật khẩu mới"
                icon={<IconLock />}
                isPassword
                placeholder="Nhập lại mật khẩu mới"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              {apiError && <ErrorAlert message={apiError} />}
              {success && <SuccessAlert message={success} />}

              {success ? (
                // Sau khi thành công — hiện thông báo redirect
                <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Đang chuyển sang đăng nhập...
                </div>
              ) : (
                <SubmitBtn
                  loading={loading}
                  label="Đổi mật khẩu"
                  loadLabel="Đang cập nhật..."
                  disabled={
                    !form.currentPassword ||
                    !form.newPassword ||
                    !form.confirmPassword
                  }
                />
              )}
            </form>

            {/* Back */}
            {!success && (
              <div className="text-center mt-5">
                <Link
                  href="/login"
                  className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  ← Quay lại đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-5">
          <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}
