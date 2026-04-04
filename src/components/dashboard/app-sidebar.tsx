"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Sparkles,
  Users,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Orders",
        href: "/dashboard/orders",
        icon: Package,
      },
      {
        title: "Products",
        href: "/dashboard/products",
        icon: ShoppingCart,
      },
      {
        title: "Packages",
        href: "/dashboard/packages",
        icon: Gift,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Setting",
        href: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Logout",
        href: "/logout",
        icon: LogOut,
        action: "logout", // We'll handle logout logic differently if needed
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-white px-6 py-6 dark:bg-zinc-950">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">PO Automation</span>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-8">
          {sidebarItems.map((group, index) => (
            <div key={index}>
              <h3 className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  if (item.action === "logout") {
                    return (
                      <button
                        key={item.title}
                        onClick={handleLogout}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800",
                          "text-red-500 hover:text-red-600 hover:bg-red-50",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800",
                        isActive
                          ? "bg-indigo-50 text-indigo-600 dark:bg-zinc-800 dark:text-white"
                          : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Friends/Mentors Section Placeholder from Design */}
        <div className="mt-8">
          <h3 className="mb-4 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Support
          </h3>
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                <Users className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Admin Support</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
