"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Landmark,
  Package,
  Users,
  Settings,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Accounts", href: "/accounts", icon: Landmark },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "HR", href: "/hr", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[72px] flex-col items-center border-r border-zinc-800 bg-zinc-950 py-4">
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
        <Bot className="h-5 w-5 text-white" />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                isActive
                  ? "bg-indigo-600/15 text-indigo-400"
                  : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.name}
              </span>
              {isActive && (
                <span className="absolute -left-[18px] h-5 w-1 rounded-r-full bg-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
