"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // No shell on login page (kept for route compatibility)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName="Mr. Nerf" />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
