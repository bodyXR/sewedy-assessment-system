"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Users,
  ClipboardList,
  History,
  RefreshCw,
  FileText,
  BookOpen,
  Send,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { AccountRole } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<AccountRole, NavItem[]> = {
  controller: [
    {
      label: "Dashboard",
      href: "/controller/dashboard",
      icon: LayoutDashboard,
    },
    { label: "Students", href: "/controller/students", icon: Users },
    {
      label: "Statistics",
      href: "/controller/statistics",
      icon: ClipboardList,
    },
    { label: "Assign Roles", href: "/controller/assign", icon: ClipboardList },
    { label: "Cycles", href: "/controller/cycles", icon: RefreshCw },
  ],
  assessor: [
    { label: "Students", href: "/assessor/students", icon: Users },
    { label: "Competencies", href: "/assessor/competencies", icon: BookOpen },
    { label: "Submissions", href: "/assessor/submissions", icon: FileText },
  ],
  verifier: [
    { label: "Monitor", href: "/verifier/results", icon: ClipboardList },
    { label: "Competencies", href: "/verifier/competencies", icon: BookOpen },
    { label: "Send Report", href: "/verifier/report", icon: Send },
    { label: "Activity Log", href: "/verifier/log", icon: History },
  ],
};

export function RoleSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, roleContext, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const accountRole = user?.accountRole ?? "assessor";
  const navItems = navByRole[accountRole] ?? [];

  const roleLabel: Record<AccountRole, string> = {
    controller: "Controller",
    assessor: "Assessor",
    verifier: "Verifier",
  };

  const roleBadgeColor: Record<AccountRole, string> = {
    controller: "bg-purple-100 text-purple-700",
    assessor: "bg-blue-100 text-blue-700",
    verifier: "bg-green-100 text-green-700",
  };

  return (
    <aside className="w-72 bg-white flex flex-col h-screen border-r border-gray-100">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Image
          src="/logo.png"
          alt="Logo"
          width={130}
          height={65}
          className="object-contain"
        />
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm truncate">
          {user?.fullName}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              roleBadgeColor[accountRole],
            )}
          >
            {roleLabel[accountRole]}
          </span>
          {roleContext?.competency && (
            <span className="text-xs text-gray-400 truncate">
              {roleContext.competency}
            </span>
          )}
          {roleContext?.classGroup && (
            <span className="text-xs font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full shrink-0">
              {roleContext.classGroup}
            </span>
          )}
        </div>
        {roleContext?.cycleName && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            {roleContext.cycleName}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium text-sm",
                isActive
                  ? "bg-gradient-to-r from-[#E40000] to-[#ff002f] text-white shadow-md"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-150 font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
