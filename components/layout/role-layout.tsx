"use client";

import { RoleSidebar } from "./role-sidebar";
import { RoleRouter } from "./role-router";
import { Menu } from "lucide-react";
import { useState } from "react";

export function RoleLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-sidebar text-sidebar-foreground rounded-lg shadow-lg hover:bg-sidebar-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <RoleSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-auto scrollbar-thin">
          <div className="lg:hidden h-14" />{" "}
          {/* Spacer for mobile menu button */}
          {children}
        </main>
      </div>
    </RoleRouter>
  );
}
