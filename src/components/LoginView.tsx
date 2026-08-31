"use client";

import React, { useState } from "react";
import { Scissors, Phone, User, ArrowRight, Sparkles } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (user: { name: string; phone: string; role: "admin" | "customer" }) => void;
  role: "admin" | "customer";
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  role = "admin",
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Please provide your Name and Phone Number");
      return;
    }

    if (role === "admin") {
      localStorage.setItem("aruna_user_name", name.trim());
      localStorage.setItem("aruna_user_phone", phone.trim());
      localStorage.setItem("aruna_role", "admin");

      // Sync active owner contact to server so customer portal always has it
      fetch("/api/owner-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      }).catch(() => {});
    } else {
      localStorage.setItem("aruna_customer_name", name.trim());
      localStorage.setItem("aruna_customer_phone", phone.trim());
      localStorage.setItem("aruna_role", "customer");
    }

    onLoginSuccess({ name: name.trim(), phone: phone.trim(), role });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4">
      {/* Mobile-first login container */}
      <div className="w-full max-w-sm bg-white rounded-3xl border border-rose-100/90 shadow-xl overflow-hidden p-6 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100/80 text-[#d9778a] flex items-center justify-center shadow-inner">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight">
            Aruna Creations
          </h1>
          <div className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[11px] font-bold text-[#d9778a]">
            {role === "admin" ? "🔐 Boutique Owner Login" : "✨ Customer Catalog Access"}
          </div>
          <p className="text-xs text-stone-500 font-medium">
            {role === "admin"
              ? "Sign in to manage orders, catalog & client requests"
              : "Enter your details to explore designer patterns & collections"}
          </p>
        </div>

        {/* Form (Name, Phone, Login Button) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "admin" ? "Enter owner name (e.g. Aruna)" : "Enter your full name"}
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a] bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a] bg-stone-50/50"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              {role === "admin"
                ? "Used for boutique admin session authentication."
                : "Used to connect you directly with Aruna Creations on WhatsApp."}
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#d9778a] hover:bg-[#c45d72] text-white text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{role === "admin" ? "Login to Boutique Dashboard" : "Enter Customer Catalog"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Quick Demo Autofill */}
        <div className="pt-2 border-t border-rose-50 flex items-center justify-center gap-2 text-[11px] text-stone-400">
          <span>Quick fill:</span>
          <button
            type="button"
            onClick={() => {
              if (role === "admin") {
                setName("Aruna Devi");
                setPhone("9876543210");
              } else {
                setName("Priya Sharma");
                setPhone("9876543210");
              }
            }}
            className="text-[#d9778a] hover:underline font-medium cursor-pointer"
          >
            {role === "admin" ? "Owner Demo" : "Customer Demo"}
          </button>
        </div>
      </div>
    </div>
  );
};
