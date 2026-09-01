"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Sparkles, Scissors, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Aruna Creations PWA registered"))
        .catch((e) => console.warn("SW registration:", e));
    }

    // Check if already installed
    if (typeof window !== "undefined") {
      const isAppStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(isAppStandalone));

      const ua = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(ua);
      setIsIOS(isApple);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    // If installing from customer portal, mark as customer-mode app
    if (typeof window !== "undefined") {
      const isCustomerPage = window.location.pathname.startsWith("/c");
      if (isCustomerPage) {
        localStorage.setItem("aruna_installed_as_customer", "true");
        localStorage.setItem("aruna_app_mode", "customer");
      }
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // For iOS, also mark the mode before showing instructions
      setShowIosInstructions(true);
    } else {
      alert("To install this app on your phone:\n1. Tap your browser menu (⋮)\n2. Tap 'Add to Home screen' or 'Install app'");
    }
  };

  if (isStandalone || isDismissed) return null;

  return (
    <>
      {/* Bottom Floating Install Banner */}
      <div className="fixed top-3 inset-x-3 max-w-sm mx-auto z-50 animate-bounce-subtle">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-rose-200/90 shadow-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 text-[#d9778a] flex items-center justify-center shadow-xs shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-stone-800 flex items-center gap-1">
                Install Aruna App <Sparkles className="w-3 h-3 text-[#d9778a]" />
              </h4>
              <p className="text-[10px] text-stone-500 font-medium leading-tight">
                Add to your phone for 1-tap boutique access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-[#d9778a] hover:bg-[#c5586f] text-white text-[11px] font-bold shadow-sm shadow-rose-200 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Install Instruction Modal */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#d9778a] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-800">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosInstructions(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#d9778a] text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <p>Tap the <strong>Share</strong> button (box with upward arrow) at the bottom of Safari.</p>
              </div>
              <div className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#d9778a] text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <p>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</p>
              </div>
              <div className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-[#d9778a] text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                <p>Tap <strong>&quot;Add&quot;</strong> in the top-right corner. The Aruna Creations app icon will appear on your home screen!</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-2.5 rounded-xl bg-[#d9778a] text-white text-xs font-bold shadow-md shadow-rose-200"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
