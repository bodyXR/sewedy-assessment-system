"use client";

import { RoleSidebar } from "./role-sidebar";
import { RoleRouter } from "./role-router";

export function RoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <RoleSidebar />
        <main className="flex-1 overflow-auto scrollbar-thin">{children}</main>
      </div>
    </RoleRouter>
  );
}
