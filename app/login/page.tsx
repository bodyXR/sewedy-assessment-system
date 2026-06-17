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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);

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
                  htmlFor="email"
                  className="block text-sm font-semibold text-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            {/* API Info */}
            <div className="mt-8 p-4 bg-gradient-to-r from-secondary to-muted rounded-xl border border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Connected to Backend API
              </p>
              <p className="text-xs text-muted-foreground">
                Use your registered email and password to sign in
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
