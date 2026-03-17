import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

const AUTH_ROUTES = ["/login", "/register", "/verify", "/change-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // 1. Phân loại các route
  const isAuthPage = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isLandingPage = pathname === "/" || pathname === "/onboarding";

  // 2. Chuyển hướng người dùng mới vào trang chủ => onboarding
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // 3. Nếu đang vào trang Auth (Login, Register...)
  if (isAuthPage) {
    if (token) {
      try {
        const payload = jwtDecode<any>(token);
        if (payload.exp * 1000 > Date.now()) {
          // Đã đăng nhập -> Dashboard (nếu có space), hoặc Onboarding (nếu chưa)
          if (payload.spaceId) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
          } else {
            return NextResponse.redirect(new URL("/onboarding", req.url));
          }
        }
      } catch {}
    }
    return NextResponse.next();
  }

  // 4. Nếu đang vào Landing Page (/onboarding)
  if (isLandingPage) {
    if (token) {
      try {
        const payload = jwtDecode<any>(token);
        if (payload.exp * 1000 > Date.now() && payload.spaceId) {
          // Đã có token + spaceId -> không cần xem onboarding nữa
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } catch {}
    }
    return NextResponse.next();
  }

  // 5. ── Nhóm Route Protected (Dashboard, Profile...) ─────────
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = jwtDecode<any>(token);

    // Hết hạn token
    if (payload.exp * 1000 < Date.now()) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("token");
      return res;
    }

    // Đã đăng nhập nhưng chưa có phòng (space) -> điều hướng đi tạo phòng
    // Ở đây tạm dẫn về onboarding, tuỳ thiết kế có thể chuyển tới /create-space
    if (!payload.spaceId && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

  } catch {
    // Lỗi token (bị sửa bậy, v.v...)
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
