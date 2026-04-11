import { Sidebar } from "@/components/layout/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-slate-50 dark:bg-[#0c140e] min-h-screen">

      <main className="flex-1 overflow-x-hidden pt-6">
        {children}
      </main>
    </div>
  );
}
