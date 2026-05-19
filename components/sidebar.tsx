"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut, Calendar, LayoutList, UserCircle } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Calendar,
    },
    {
      label: "Bulk Assess",
      href: "/dashboard/bulk-assess",
      icon: LayoutList,
    },
    {
      label: "Students",
      href: "/dashboard/students",
      icon: UserCircle,
    },
    {
      label: "Competencies",
      href: "/dashboard/competencies",
      icon: LayoutList,
    },
  ];

  return (
    <aside className="w-80 bg-[#2d1b1b] flex flex-col h-screen border-r border-red-950/30">
      {/* Logo Area */}
      <div className="p-6 border-b border-red-950/30">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={140}
            height={70}
            className="object-contain"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 font-medium text-base",
                isActive
                  ? "bg-gradient-to-r from-[#E40000] to-[#ff002f] text-white shadow-lg shadow-red-900/30"
                  : "text-red-200/60 hover:text-red-100 hover:bg-red-950/40",
              )}
              onClick={() => router.push(item.href)}
            >
              <Icon className="w-6 h-6" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-red-950/30">
        <button
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-300 hover:text-red-200 hover:bg-red-950/50 transition-all duration-200 font-medium text-base"
          onClick={handleLogout}
        >
          <LogOut className="w-6 h-6" />
          Logout
        </button>
      </div>
    </aside>
  );
}
