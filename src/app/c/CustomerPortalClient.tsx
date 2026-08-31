"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { DesignCard } from "@/components/DesignCard";
import { ViewDesignModal } from "@/components/ViewDesignModal";
import { LoginView } from "@/components/LoginView";
import { InstallPwaPrompt } from "@/components/InstallPwaPrompt";
import { DesignData } from "@/types";
import { MessageCircle, Phone, Search, Sparkles } from "lucide-react";

export default function CustomerPortalClient() {
  const searchParams = useSearchParams();
  const requestedDesignModel = searchParams.get("design");
  const requestedOwnerPhone = searchParams.get("owner");

  const [customer, setCustomer] = useState<{ name: string; phone: string } | null>(null);
  const [ownerPhone, setOwnerPhone] = useState<string>("9876543210");
  const [designs, setDesigns] = useState<DesignData[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<DesignData | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Store owner phone from incoming WhatsApp link if present, or fetch from server
  useEffect(() => {
    if (requestedOwnerPhone) {
      localStorage.setItem("aruna_owner_phone", requestedOwnerPhone);
      setOwnerPhone(requestedOwnerPhone);
    } else {
      const stored = localStorage.getItem("aruna_owner_phone") || localStorage.getItem("aruna_user_phone");
      if (stored) {
        setOwnerPhone(stored);
      } else {
        fetch("/api/owner-contact")
          .then((r) => r.json())
          .then((data) => {
            if (data.owner?.phone) {
              setOwnerPhone(data.owner.phone);
              localStorage.setItem("aruna_owner_phone", data.owner.phone);
            }
          })
          .catch(() => {});
      }
    }
  }, [requestedOwnerPhone]);

  // Check client customer session
  useEffect(() => {
    const savedName = localStorage.getItem("aruna_customer_name");
    const savedPhone = localStorage.getItem("aruna_customer_phone");
    if (savedName && savedPhone) {
      setCustomer({ name: savedName, phone: savedPhone });
    }
  }, []);

  // Fetch designs
  useEffect(() => {
    // 1. Instant hydration from cached designs
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("aruna_saved_designs_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDesigns(parsed);
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }

    const fetchDesigns = async () => {
      try {
        const res = await fetch("/api/designs", { cache: "no-store" });
        const data = await res.json();
        if (data.designs && Array.isArray(data.designs)) {
          setDesigns(data.designs);
          localStorage.setItem("aruna_saved_designs_cache", JSON.stringify(data.designs));

          // If URL contains ?design=AC-EMB-101, open it immediately
          if (requestedDesignModel) {
            const found = data.designs.find(
              (d: DesignData) =>
                d.modelNumber.toLowerCase() === requestedDesignModel.toLowerCase()
            );
            if (found) {
              setSelectedDesign(found);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDesigns();
  }, [requestedDesignModel]);

  if (!customer) {
    return (
      <LoginView
        role="customer"
        onLoginSuccess={(u) => {
          setCustomer({ name: u.name, phone: u.phone });
        }}
      />
    );
  }

  // Filtered designs
  const filteredDesigns = designs.filter((d) => {
    const matchesCategory =
      categoryFilter === "all" || d.type === categoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.pattern.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 font-sans text-stone-800">
      {/* Install PWA Prompt for Mobile Visitors */}
      <InstallPwaPrompt />

      {/* Mobile Navbar */}
      <Navbar
        userRole="customer"
        onSwitchRole={() => {
          window.location.href = "/";
        }}
      />

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-3 space-y-4">
        {/* Banner greeting */}
        <div className="bg-rose-100/50 p-4 rounded-3xl border border-rose-200/60 shadow-xs relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d9778a] bg-white px-2 py-0.5 rounded-full border border-rose-100">
              Welcome {customer.name}
            </span>
            <h2 className="text-base font-extrabold text-stone-800 mt-1">
              Bespoke Bridal & Designer Catalog
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Explore exquisite hand embroidery & custom couture patterns tailored to perfection.
            </p>
          </div>
          <div className="absolute right-2 -bottom-2 text-rose-200/50 pointer-events-none">
            <Sparkles className="w-20 h-20" />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search embroidery, blouse patterns..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-[#d9778a]"
            />
          </div>

          {/* Category Pills (Embroidery / Stitching / Other / All) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(["all", "embroidery", "stitching", "other"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                  categoryFilter === cat
                    ? "bg-[#d9778a] text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-rose-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Designs Catalog (No internal prices shown to customer, strictly as per wireframe and requirements) */}
        {filteredDesigns.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-rose-100/80 shadow-xs space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-[#d9778a] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-700">New Collection Coming Soon</h3>
            <p className="text-xs text-stone-500">
              Our master designers are currently uploading our latest bridal embroidery and bespoke patterns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredDesigns.map((design, idx) => (
              <DesignCard
                key={design._id || design.id || idx}
                design={design}
                isAdmin={false}
                onViewMore={(d) => setSelectedDesign(d)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Action Buttons for Customer (WhatsApp & Contact) */}
      <div className="fixed bottom-3 inset-x-0 max-w-md mx-auto px-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const customerLink = typeof window !== "undefined" ? `${window.location.origin}/c` : "";
            const cleanDigits = (ownerPhone || "9876543210").replace(/\D/g, "");
            const msg = `✨ *Hello Aruna Creations!* ✨\n\nI am browsing your online boutique collection at ${customerLink}.\nI want to discuss customization and stitching for an outfit! 👗`;
            window.open(`https://wa.me/91${cleanDigits}?text=${encodeURIComponent(msg)}`, "_blank");
          }}
          className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Boutique</span>
        </button>

        <a
          href={`tel:${(ownerPhone || "9876543210").replace(/\D/g, "")}`}
          className="flex-1 py-3 px-3 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold shadow-lg shadow-stone-400 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          <span>Call Boutique</span>
        </a>
      </div>

      {/* Design Details View Modal for Customer */}
      <ViewDesignModal
        isOpen={Boolean(selectedDesign)}
        design={selectedDesign}
        isAdmin={false}
        onClose={() => setSelectedDesign(null)}
      />
    </div>
  );
}
