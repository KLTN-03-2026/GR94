"use server";

import { cookies } from "next/headers";
import { sendRequestServer } from "./api";

const BE = process.env.NEXT_PUBLIC_BE_URL ?? "http://localhost:8081/api/";

//  Helper lấy token phía server 
const getToken = async () => (await cookies()).get("token")?.value ?? "";

//  Helper set cookie 
const setTokenCookie = async (token: string) => {
  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
    path: "/",
  });
};



//  Đăng nhập 
export const loginAction = async (
  email: string,
  password: string,
): Promise<IBackendRes> => {
  const res = await sendRequestServer<IBackendRes>({
    url: `${BE}/auths/login`,
    method: "POST",
    body: { email, password },
  });
  if (res?.access_token) {
    await setTokenCookie(res.access_token);
  }
  return res;
};

//  Đăng ký 
export const registerAction = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<IBackendRes> => {
  return sendRequestServer<IBackendRes>({
    url: `${BE}/auths/register`,
    method: "POST",
    body: data,
  });
};

//  Xác thực email 
export const verifyAccountAction = async (
  email: string,
  code: string,
): Promise<IBackendRes> => {
  return sendRequestServer<IBackendRes>({
    url: `${BE}/auths/verify-account`,
    method: "POST",
    body: { email, code },
  });
};

//  Gửi lại mã xác thực 
export const resendCodeAction = async (email: string): Promise<IBackendRes> => {
  return sendRequestServer<IBackendRes>({
    url: `${BE}/auths/resend-code`,
    method: "POST",
    body: { email },
  });
};

//  Đổi mật khẩu 
export const changePasswordAction = async (
  currentPassword: string,
  newPassword: string,
): Promise<IBackendRes> => {
  return sendRequestServer<IBackendRes>({
    url: `${BE}/users/me/password`,
    method: "PATCH",
    token: await getToken(),
    body: { currentPassword, newPassword },
  });
};

//  Đăng xuất 
export const logoutAction = async (): Promise<void> => {
  (await cookies()).delete("token");
};
