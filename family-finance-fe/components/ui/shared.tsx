//  SVG Icons
export const IconEye = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const IconMail = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const IconLock = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const IconUser = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconLeaf = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export const IconCheck = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconAlertCircle = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const IconCheckCircle = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const IconSpinner = ({ className = "" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
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
);

//  Shared Input component
import { useState, forwardRef } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  isPassword?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon, error, isPassword, className, type, ...props }, ref) => {
    const [showPass, setShowPass] = useState(false);
    const inputType = isPassword ? (showPass ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full h-12 rounded-xl border text-sm text-slate-900 dark:text-white
              bg-slate-50 dark:bg-slate-800/50 placeholder:text-slate-400
              outline-none transition-all
              ${icon ? "pl-10" : "pl-4"}
              ${isPassword ? "pr-12" : "pr-4"}
              ${
                error
                  ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                  : "border-slate-200 dark:border-slate-700 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
              }
              ${className ?? ""}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPass ? <IconEyeOff /> : <IconEye />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <IconAlertCircle /> {error}
          </span>
        )}
      </div>
    );
  },
);
InputField.displayName = "InputField";

//  Error Alert
export const ErrorAlert = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
    <span className="text-red-500 flex-shrink-0">
      <IconAlertCircle />
    </span>
    <span className="text-red-600 dark:text-red-400 text-sm">{message}</span>
  </div>
);

//  Success Alert
export const SuccessAlert = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
    <span className="text-green-500 flex-shrink-0">
      <IconCheckCircle />
    </span>
    <span className="text-green-600 dark:text-green-400 text-sm">
      {message}
    </span>
  </div>
);

//  Submit Button
interface SubmitBtnProps {
  loading: boolean;
  label: string;
  loadLabel?: string;
  disabled?: boolean;
}
export const SubmitBtn = ({
  loading,
  label,
  loadLabel,
  disabled,
}: SubmitBtnProps) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="h-12 w-full rounded-xl bg-[#22C55E] hover:bg-green-500 active:scale-[0.98]
               text-white font-semibold text-sm tracking-wide
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-all shadow-lg shadow-green-500/25
               flex items-center justify-center gap-2"
  >
    {loading ? (
      <>
        <IconSpinner className="w-4 h-4" />
        {loadLabel ?? "Đang xử lý..."}
      </>
    ) : (
      label
    )}
  </button>
);

//  Logo
export const GiaKeLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: 32, md: 36, lg: 44 };
  const text = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <div
        style={{ width: s, height: s }}
        className="bg-[#22C55E] rounded-xl flex items-center justify-center text-white flex-shrink-0"
      >
        <IconLeaf size={s * 0.6} />
      </div>
      <span
        className={`text-slate-900 dark:text-white font-bold tracking-tight ${text[size]}`}
      >
        Family Finance
      </span>
    </div>
  );
};
