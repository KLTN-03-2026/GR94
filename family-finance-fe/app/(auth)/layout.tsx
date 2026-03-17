// Layout cho nhóm (auth) — không có sidebar, không có header
// Chỉ render children trực tiếp
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
