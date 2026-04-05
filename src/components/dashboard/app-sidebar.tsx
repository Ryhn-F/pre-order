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
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { useState } from "react";
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
    title: "Cashier",
    items: [
      {
        title: "POS",
        href: "/dashboard/cashier",
        icon: ShoppingCart, // using ShoppingCart to avoid missing Calculator icon
      },
      {
        title: "Active Orders",
        href: "/dashboard/cashier/orders",
        icon: Package, // using Package to avoid missing ListOrdered icon
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
  const [isFolded, setIsFolded] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-white py-6 dark:bg-zinc-950 transition-all duration-300",
      isFolded ? "w-[80px] px-3 items-center" : "w-[250px] px-6"
    )}>
      <div className={cn("mb-8 flex items-center gap-2", isFolded ? "justify-center px-0 w-full" : "px-2")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        {!isFolded && <span className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden">PO Automation</span>}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-6 w-full">
          {sidebarItems.map((group, index) => (
            <div key={index} className="w-full">
              {!isFolded && (
                <h3 className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap overflow-hidden">
                  {group.title}
                </h3>
              )}
              {isFolded && <div className="h-4"></div>}
              <div className="space-y-1 w-full">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  if (item.action === "logout") {
                    return (
                      <button
                        key={item.title}
                        onClick={handleLogout}
                        title={isFolded ? item.title : undefined}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 text-red-500 hover:text-red-600 hover:bg-red-50",
                          isFolded ? "justify-center px-0" : "px-3"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isFolded && <span>{item.title}</span>}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      title={isFolded ? item.title : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800",
                        isActive
                          ? "bg-indigo-50 text-indigo-600 dark:bg-zinc-800 dark:text-white"
                          : "text-muted-foreground",
                        isFolded ? "justify-center px-0" : "px-3"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isFolded && <span>{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {!isFolded && (
            <div className="w-full">
              <h3 className="mb-4 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Support
              </h3>
              <div className="space-y-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center">
                    <Users className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="text-sm overflow-hidden">
                    <p className="font-medium whitespace-nowrap">Admin Support</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setIsFolded(!isFolded)}
            className={cn(
              "flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 text-muted-foreground dark:border-zinc-800 dark:bg-zinc-900 justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors",
              isFolded ? "w-10 mx-auto" : "w-full gap-2"
            )}
          >
            {isFolded ? <Menu className="h-5 w-5" /> : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
