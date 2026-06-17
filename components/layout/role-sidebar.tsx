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
  X,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { AccountRole } from "@/lib/types";
import { useEffect } from "react";

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
      label: "Enroll Students",
      href: "/controller/enroll",
      icon: ClipboardList,
    },
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

interface RoleSidebarProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
}

export function RoleSidebar({ isOpen = true, onClose }: RoleSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, roleContext, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/landing");
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    onClose?.();
  };

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const accountRole = user?.accountRole ?? "assessor";

  // Use assigned role from roleContext if available (for assessors/verifiers)
  // This determines which sidebar navigation to show
  const effectiveRole = roleContext?.assignedRole || accountRole;
  const navItems = navByRole[effectiveRole] ?? [];

  const roleLabel: Record<AccountRole, string> = {
    controller: "Controller",
    assessor: "Assessor",
    verifier: "Verifier",
  };

  const roleBadgeColor: Record<AccountRole, string> = {
    controller:
      "bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30",
    assessor:
      "bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30",
    verifier:
      "bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30",
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo & Close Button */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="Logo"
            width={130}
            height={65}
            className="object-contain"
          />
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-5 border-b border-sidebar-border bg-sidebar-accent/30">
          <p className="font-bold text-sidebar-foreground text-sm uppercase tracking-wider truncate mb-2">
            {user?.fullName}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-none border uppercase tracking-widest",
                roleBadgeColor[effectiveRole],
              )}
            >
              {roleLabel[effectiveRole]}
            </span>
            {roleContext?.competency && (
              <span className="text-[10px] font-bold text-sidebar-foreground/60 border border-sidebar-border px-2 py-0.5 rounded-none uppercase tracking-widest truncate">
                {roleContext.competency}
              </span>
            )}
            {roleContext?.classGroup && (
              <span className="text-[10px] font-bold bg-sidebar-primary text-sidebar-primary-foreground px-2 py-0.5 rounded-none uppercase tracking-widest shrink-0">
                Class {roleContext.classGroup}
              </span>
            )}
          </div>
          {roleContext?.cycleName && (
            <p className="text-[10px] font-bold text-sidebar-foreground/50 mt-2 uppercase tracking-widest truncate">
              CYCLE: {roleContext.cycleName}
            </p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-none transition-all duration-150 font-bold text-sm uppercase tracking-wider border-l-4",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-sidebar-primary" : "",
                  )}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive border-l-4 border-transparent transition-all duration-150 font-bold text-sm uppercase tracking-wider"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
