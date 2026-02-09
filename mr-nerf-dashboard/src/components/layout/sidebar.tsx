"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Newspaper,
  KanbanSquare,
  Gamepad2,
  PenTool,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/content-feed", label: "Content Feed", icon: Newspaper },
  { href: "/scripts", label: "Script Writer", icon: PenTool },
  { href: "/kanban", label: "Kanban Board", icon: KanbanSquare },
  { href: "/headshot", label: "Headshot", icon: Crosshair },
];

interface SidebarProps {
  userName?: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-card">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Mr. Nerf</h1>
            <p className="text-xs text-muted-foreground">Content Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t">
        {userName && (
          <p className="text-sm font-medium px-3">{userName}</p>
        )}
      </div>
    </div>
  );
}
