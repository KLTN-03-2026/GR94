"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

import { parseMessage, isError } from "@/lib/helper";
import { createSpaceAction, joinSpaceAction } from "@/lib/action";

const IcoArrow = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IcoKey = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const IcoHome = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IcoFamily = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IcoSpinner = () => (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
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

// Error message
const ErrMsg = ({ msg }: { msg: string }) =>
  msg ? (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span className="text-red-600 text-sm">{msg}</span>
    </div>
  ) : null;

const SUGGESTIONS = ["Gia đình", "Nhà mình", "Family", "Tổ ấm nhỏ"];

export default function SpaceSetupPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [spaceName, setSpaceName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loadCreate, setLoadCreate] = useState(false);
  const [loadJoin, setLoadJoin] = useState(false);
  const [errCreate, setErrCreate] = useState("");
  const [errJoin, setErrJoin] = useState("");

  //  Tạo phòng
  // Luồng: gọi API → BE tạo Space + ký JWT mới → FE nhận JWT
  // → set cookie (trong action) → cập nhật Zustand → dashboard
  const handleCreate = async () => {
    if (!spaceName.trim()) {
      setErrCreate("Vui lòng nhập tên phòng");
      return;
    }
    setErrCreate("");
    setLoadCreate(true);
    try {
      const res = await createSpaceAction(spaceName.trim());
      if (isError(res)) {
        setErrCreate(parseMessage(res.message));
        return;
      }

      // BE trả user mới có spaceId + role=parent + access_token mới
      // actions.ts đã set httpOnly cookie → chỉ cần cập nhật Zustand
      setAuth(res.user!, res.access_token!);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrCreate("Không thể kết nối server. Thử lại sau.");
    } finally {
      setLoadCreate(false);
    }
  };

  //  Vào phòng
  // Luồng giống hệt createSpace — chỉ khác role=member
  const handleJoin = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (code.length < 6) {
      setErrJoin("Mã mời gồm 6 ký tự");
      return;
    }
    setErrJoin("");
    setLoadJoin(true);
    try {
      const res = await joinSpaceAction(code);
      if (isError(res)) {
        setErrJoin(parseMessage(res.message));
        return;
      }

      setAuth(res.user!, res.access_token!);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrJoin("Không thể kết nối server. Thử lại sau.");
    } finally {
      setLoadJoin(false);
    }
  };

  //  Input mã mời
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setInviteCode(v);
    if (errJoin) setErrJoin("");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7f9] to-[#eef1f3] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6bff8f]/30 rounded-2xl mb-5 text-[#006a2d]">
            <IcoFamily />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#2c2f31]">
            Bắt đầu hành trình
          </h1>
          <p className="text-[#595c5e] text-sm font-medium mt-2">
            Xin chào{" "}
            <span className="font-semibold text-[#006a2d]">
              {user?.name ?? "bạn"}
            </span>{" "}
            — tạo phòng mới hoặc nhập mã mời từ người thân.
          </p>
        </div>

        {/* 2 CARD — responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {/*  Card tạo phòng */}
          <div className="bg-white rounded-3xl p-7 shadow-[0_32px_64px_rgba(44,47,49,0.06)] border border-white/40 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006a2d]" />
              <span className="text-[#006a2d] font-bold text-[11px] tracking-widest uppercase">
                Tạo gia đình mới
              </span>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#6bff8f]/10 rounded-2xl">
              <div className="w-10 h-10 bg-[#6bff8f]/30 rounded-xl flex items-center justify-center text-[#006a2d] flex-shrink-0">
                <IcoHome />
              </div>
              <div>
                <div className="font-bold text-[#2c2f31] text-sm">
                  Bạn là quản lý (parent)
                </div>
                <div className="text-[#595c5e] text-xs font-medium mt-0.5 leading-relaxed">
                  Toàn quyền quản lý thu chi, ngân sách và thành viên.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#747779] tracking-widest uppercase px-1">
                Tên gia đình
              </label>
              <input
                type="text"
                value={spaceName}
                onChange={(e) => {
                  setSpaceName(e.target.value);
                  if (errCreate) setErrCreate("");
                }}
                placeholder="Ví dụ: Gia đình Nguyễn"
                maxLength={50}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="w-full h-14 px-5 bg-[#d9dde0]/40 rounded-2xl text-[#2c2f31]
                           placeholder:text-[#abadaf] text-sm font-medium border-0 outline-none
                           focus:ring-2 focus:ring-[#006a2d]/20 focus:bg-white transition-all"
              />
              <div className="flex flex-wrap gap-2 px-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSpaceName(s);
                      if (errCreate) setErrCreate("");
                    }}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#6bff8f]/20 text-[#006a2d]
                               hover:bg-[#6bff8f]/40 transition-colors font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <ErrMsg msg={errCreate} />

            <button
              onClick={handleCreate}
              disabled={loadCreate || !spaceName.trim()}
              className="group w-full h-14 bg-[#006a2d] hover:bg-[#005d26] text-white font-bold
                         rounded-2xl flex items-center justify-center gap-3
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-[0.98] transition-all shadow-lg shadow-[#006a2d]/20"
            >
              {loadCreate ? (
                <>
                  <IcoSpinner />
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <span>Tạo ngay</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    <IcoArrow />
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Divider mobile */}
          <div className="flex lg:hidden items-center gap-4">
            <div className="flex-1 h-px bg-[#dfe3e6]" />
            <span className="text-[11px] font-black text-[#747779] tracking-[0.2em]">
              HOẶC
            </span>
            <div className="flex-1 h-px bg-[#dfe3e6]" />
          </div>

          {/*  Card join phòng */}
          <div className="bg-white rounded-3xl p-7 shadow-[0_32px_64px_rgba(44,47,49,0.06)] border border-white/40 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006573]" />
              <span className="text-[#006573] font-bold text-[11px] tracking-widest uppercase">
                Tham gia bằng mã
              </span>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#00e0fd]/10 rounded-2xl">
              <div className="w-10 h-10 bg-[#00e0fd]/30 rounded-xl flex items-center justify-center text-[#006573] flex-shrink-0">
                <IcoKey />
              </div>
              <div>
                <div className="font-bold text-[#2c2f31] text-sm">
                  Bạn là thành viên (member)
                </div>
                <div className="text-[#595c5e] text-xs font-medium mt-0.5 leading-relaxed">
                  Nhập và theo dõi chi tiêu cá nhân trong phòng chung.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#747779] tracking-widest uppercase px-1">
                Mã mời (6 ký tự)
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={handleCodeChange}
                placeholder="VD: A3X9KP"
                autoCapitalize="characters"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="w-full h-14 px-5 bg-[#d9dde0]/40 rounded-2xl text-[#2c2f31]
                           placeholder:text-[#abadaf] placeholder:tracking-normal placeholder:font-normal
                           text-center tracking-[0.4em] font-mono font-bold text-lg uppercase
                           border-0 outline-none
                           focus:ring-2 focus:ring-[#006573]/20 focus:bg-white transition-all"
              />
              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-200 ${
                      inviteCode[i] ? "w-5 bg-[#006573]" : "w-2 bg-[#dfe3e6]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <ErrMsg msg={errJoin} />

            <button
              onClick={handleJoin}
              disabled={loadJoin || inviteCode.length < 6}
              className="w-full h-14 bg-[#eef1f3] hover:bg-[#e5e9eb] text-[#2c2f31] font-bold
                         rounded-2xl flex items-center justify-center gap-3
                         border border-[#dfe3e6]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-[0.98] transition-all"
            >
              {loadJoin ? (
                <>
                  <IcoSpinner />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <span className="text-[#006573]">
                    <IcoKey />
                  </span>
                  <span>Tham gia</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
