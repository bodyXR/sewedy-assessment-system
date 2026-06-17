"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import type { AccountRole, CurrentRoleContext } from "./types";
import { authApi, api, type LoginResponse } from "./api-client";

interface User {
  id: string;
  accountId?: number; // From LoginResponse
  username: string;
  fullName: string;
  accountRole: AccountRole;
  token?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  roleContext: CurrentRoleContext | null;
  isRoleLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend role names to frontend AccountRole
function mapRoleToAccountRole(roleName: string): AccountRole {
  const normalized = roleName.toLowerCase();
  if (normalized === "control" || normalized === "controller")
    return "controller";
  if (normalized === "assessor") return "assessor";
  if (normalized === "verifier") return "verifier";
  return "assessor"; // default fallback
}

async function resolveRoleContext(
  userId: string,
  accountRole: AccountRole,
): Promise<CurrentRoleContext | null> {
  // Controller has no cycle assignment — they manage everything
  if (accountRole === "controller") {
    return { accountRole: "controller" };
  }

  try {
    console.log("🔍 Fetching assignments for user:", userId);

    // Get user's assignments (backend now filters out deleted/inactive cycles)
    const allAssignments = await api.courseRoundInstructors.getByInstructor(
      Number(userId),
    );

    console.log("📋 Assignments received:", allAssignments);

    if (!allAssignments || allAssignments.length === 0) {
      console.warn("⚠️ No active assignments found for user:", userId);
      return null;
    }

    // Use the first active assignment
    const assignment = allAssignments[0];
    console.log("✅ Using assignment:", assignment);

    // Fetch the specific course round for this assignment
    let courseRound;
    try {
      console.log("🔍 Fetching course round:", assignment.courseRoundId);
      courseRound = await api.courseRounds.getById(assignment.courseRoundId);
      console.log("📚 Course round fetched:", courseRound);
      console.log(
        "📚 Course round statusId:",
        courseRound.statusId,
        "type:",
        typeof courseRound.statusId,
      );

      // Check if the round is active (statusId 1 = active, 0 = inactive)
      if (courseRound.statusId !== 1) {
        console.warn(
          "⚠️ Course round is inactive (statusId !== 1):",
          assignment.courseRoundId,
        );
        return null;
      }
    } catch (error) {
      console.error(
        "❌ Course round not found or deleted:",
        assignment.courseRoundId,
        error,
      );
      return null;
    }

    const assignedRole = assignment.roleName.toLowerCase() as
      | "assessor"
      | "verifier";

    console.log("✅ Resolved role context successfully:", {
      userId,
      assignedRole,
      roleName: assignment.roleName,
      courseRoundId: assignment.courseRoundId,
      roundNumber: courseRound.roundNumber,
    });

    return {
      accountRole,
      assignedRole,
      cycleId: assignment.courseRoundId.toString(),
      cycleName: `Round ${courseRound.roundNumber}`,
    };
  } catch (error) {
    console.error("❌ Error resolving role context:", error);
    return null;
  }
}

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
        // Resolve role asynchronously from backend
        resolveRoleContext(parsed.id, parsed.accountRole).then((context) => {
          setRoleContext(context);
          setIsRoleLoading(false);
        });
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call the real API
      const response: LoginResponse = await authApi.login({ email, password });

      const accountRole = mapRoleToAccountRole(response.roleName);

      const userData: User = {
        id: response.accountId.toString(),
        accountId: response.accountId,
        username: response.email.split("@")[0], // Extract username from email
        fullName: response.fullNameEn,
        accountRole,
        token: response.token,
        email: response.email,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      setIsRoleLoading(true);
      const context = await resolveRoleContext(
        userData.id,
        userData.accountRole,
      );
      setRoleContext(context);
      setIsRoleLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRoleContext(null);
    localStorage.removeItem("user");
  };

  const contextValue = useMemo(
    () => ({ user, isLoading, roleContext, isRoleLoading, login, logout }),
    [user, isLoading, roleContext, isRoleLoading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
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
