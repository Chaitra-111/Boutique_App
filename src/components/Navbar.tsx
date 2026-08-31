"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Users, FileEdit, ArrowRightLeft, Scissors } from "lucide-react";

interface NavbarProps {
  activeTab?: "home" | "design" | "customer";
  onTabChange?: (tab: "home" | "design" | "customer") => void;
  hasDrafts?: boolean;
  onOpenDrafts?: () => void;
  userRole?: "admin" | "customer";
  onSwitchRole?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = "home",
  onTabChange,
  hasDrafts = false,
  onOpenDrafts,
  userRole = "admin",
  onSwitchRole,
}) => {
  const pathname = usePathname();
  const isCustomerPortal = pathname?.startsWith("/c") || userRole === "customer";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-[#d9778a] shadow-xs">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#2d2426] flex items-center gap-1.5">
              Aruna Creations
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-rose-50 text-[#d9778a] border border-rose-100">
                {isCustomerPortal ? "Client View" : "Boutique"}
              </span>
            </h1>
            <p className="text-[11px] text-[#6f6568]">Haute Couture & Bridal Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCustomerPortal && (
            <>
              {onOpenDrafts && (
                <button
                  onClick={onOpenDrafts}
                  className={`relative px-2.5 py-1 text-xs rounded-full font-medium transition-all flex items-center gap-1 ${
                    hasDrafts
                      ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                  title="View saved drafts"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Draft</span>
                  {hasDrafts && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                  )}
                </button>
              )}

              {onSwitchRole ? (
                <button
                  onClick={onSwitchRole}
                  className="p-1.5 rounded-full text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Preview Customer View"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/c"
                  className="p-1.5 rounded-full text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Preview Customer View"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Admin 3-Tab Header (as sketched: Home | Design | Customer) */}
      {!isCustomerPortal && (
        <div className="max-w-md mx-auto px-2 pb-1.5 flex items-center justify-around border-t border-rose-50/60 bg-rose-50/30">
          <button
            onClick={() => onTabChange && onTabChange("home")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "home"
                ? "bg-white text-[#d9778a] shadow-xs border border-rose-100"
                : "text-stone-600 hover:text-[#d9778a]"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onTabChange && onTabChange("design")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "design"
                ? "bg-white text-[#d9778a] shadow-xs border border-rose-100"
                : "text-stone-600 hover:text-[#d9778a]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Design</span>
          </button>

          <button
            onClick={() => onTabChange && onTabChange("customer")}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "customer"
                ? "bg-white text-[#d9778a] shadow-xs border border-rose-100"
                : "text-stone-600 hover:text-[#d9778a]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>
        </div>
      )}
    </header>
  );
};
