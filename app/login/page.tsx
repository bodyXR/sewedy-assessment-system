"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/landing/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);

      toast({
        title: "Success",
        description: "Login successful",
      });

      // Get the user from localStorage to determine role
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);

        // Role-based redirection
        switch (user.accountRole) {
          case "controller":
            router.push("/controller/dashboard");
            break;
          case "assessor":
            router.push("/assessor/students");
            break;
          case "verifier":
            router.push("/verifier/results");
            break;
          default:
            router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary to-background relative overflow-hidden pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <Card className="w-full max-w-md mx-4 shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 animate-in relative z-10">
          <div className="p-8 lg:p-10">
            {/* Logo/Branding Area */}
            <div className="text-center flex flex-col items-center mb-8">
              <Image
                src="/logo.png"
                alt="Logo"
                width={200}
                height={96}
                className="object-contain"
              />

              <p className="text-muted-foreground text-sm mt-5 lg:text-base">
                Sign in to your assessment account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-foreground"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-background/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-foreground"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-background/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold h-11 shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo Credentials Info */}
            <div className="mt-8 p-4 bg-gradient-to-r from-secondary to-muted rounded-xl border border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Demo Credentials (password: demo123)
              </p>
              <div className="space-y-1.5">
                {[
                  { username: "controller", role: "Controller" },
                  { username: "assessor1", role: "Assessor" },
                  { username: "verifier1", role: "Verifier" },
                ].map(({ username, role }) => (
                  <div
                    key={username}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{role}</span>
                    <span className="font-mono font-semibold text-foreground bg-background/50 px-3 py-1 rounded-md">
                      {username}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
