"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { AccountRole, CurrentRoleContext } from "./types";
import { mockUsers, mockRoleAssignments, mockCycles } from "./mock-data";

interface User {
  id: string;
  username: string;
  fullName: string;
  accountRole: AccountRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  roleContext: CurrentRoleContext | null;
  isRoleLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials map: username → password
const DEMO_CREDENTIALS: Record<string, string> = {
  controller: "demo123",
  assessor1: "demo123",
  assessor2: "demo123",
  assessor3: "demo123",
  verifier1: "demo123",
  verifier2: "demo123",
  // legacy
  teacher: "demo123",
  admin: "demo123",
};

function resolveRoleContext(
  userId: string,
  accountRole: AccountRole,
): CurrentRoleContext | null {
  // Controller has no cycle assignment — they manage everything
  if (accountRole === "controller") {
    return { accountRole: "controller" };
  }

  // Find the active cycle
  const activeCycle = mockCycles.find((c) => c.status === "active");
  if (!activeCycle) return null;

  // Find assignment for this user in the active cycle
  const assignment = mockRoleAssignments.find(
    (ra) => ra.userId === userId && ra.cycleId === activeCycle.id,
  );
  if (!assignment) return null;

  return {
    accountRole,
    class: assignment.class,
    competency: assignment.competency,
    assignedRole: assignment.assignedRole,
    cycleId: activeCycle.id,
    cycleName: activeCycle.name,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roleContext, setRoleContext] = useState<CurrentRoleContext | null>(
    null,
  );
  const [isRoleLoading, setIsRoleLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
        setIsRoleLoading(true);
        // Simulate async role resolution
        setTimeout(() => {
          setRoleContext(resolveRoleContext(parsed.id, parsed.accountRole));
          setIsRoleLoading(false);
        }, 300);
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const expectedPassword = DEMO_CREDENTIALS[username];
      if (!expectedPassword || password !== expectedPassword) {
        throw new Error("Invalid credentials");
      }

      // Map legacy usernames
      const lookupUsername =
        username === "admin"
          ? "controller"
          : username === "teacher"
            ? "assessor1"
            : username;
      const mockUser = mockUsers.find((u) => u.username === lookupUsername);
      if (!mockUser) throw new Error("User not found");

      const userData: User = {
        id: mockUser.id,
        username: mockUser.username,
        fullName: mockUser.fullName,
        accountRole: mockUser.accountRole,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      setIsRoleLoading(true);
      setTimeout(() => {
        setRoleContext(resolveRoleContext(userData.id, userData.accountRole));
        setIsRoleLoading(false);
      }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRoleContext(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, roleContext, isRoleLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function useCurrentRole(): CurrentRoleContext | null {
  const { roleContext } = useAuth();
  return roleContext;
}
