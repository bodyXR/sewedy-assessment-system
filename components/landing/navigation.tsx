"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    if (pathname === "/landing" || pathname === "/") {
      // If on landing page, scroll to section
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      // If on another page (like login), navigate to landing page with hash
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-gray-950/80 backdrop-blur-xl border-b border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => router.push("/landing")}
            className="flex items-center gap-3 group"
          >
            <img
              src="/logo.png"
              alt="Assessor Logo"
              className="h-10 w-auto object-contain"
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavClick("features")}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick("Workflow")}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Workflow
            </button>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/login")}
              className="hidden md:inline-flex text-gray-400 hover:text-white hover:bg-gray-900"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
