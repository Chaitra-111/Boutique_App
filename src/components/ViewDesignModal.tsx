"use client";

import React, { useState } from "react";
import { DesignData } from "@/types";
import { X, Sparkles, MessageCircle, Share2, Phone, Heart, Check, Edit3 } from "lucide-react";

interface ViewDesignModalProps {
  design: DesignData | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (design: DesignData) => void;
}

export const ViewDesignModal: React.FC<ViewDesignModalProps> = ({
  design,
  isOpen,
  onClose,
  isAdmin = false,
  onEdit,
}) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [interestedSent, setInterestedSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !design) return null;

  const images = design.images && design.images.length > 0
    ? design.images
    : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"];

  const getShareLink = () => {
    if (typeof window === "undefined") return "";
    const ownerPhone = localStorage.getItem("aruna_user_phone") || localStorage.getItem("aruna_owner_phone") || "9876543210";
    return `${window.location.origin}/c?design=${encodeURIComponent(design.modelNumber)}&owner=${encodeURIComponent(ownerPhone)}`;
  };

  const getOwnerPhone = () => {
    if (typeof window === "undefined") return "9876543210";
    return localStorage.getItem("aruna_owner_phone") || localStorage.getItem("aruna_user_phone") || "9876543210";
  };

  const handleWhatsAppShare = () => {
    const customerLink = getShareLink();
    const ownerPhoneDigits = getOwnerPhone().replace(/\D/g, "");

    const message = isAdmin
      ? `✨ *Hello from Aruna Creations!* ✨\n\nHere are the details for our exclusive boutique design:\n👗 *Design Name:* ${design.name}\n🔖 *Model Number:* ${design.modelNumber}\n🧵 *Type:* ${design.type.toUpperCase()}${design.customType ? ` (${design.customType})` : ""}\n🎨 *Pattern:* ${design.pattern || "Designer Tailored Pattern"}\n📝 *Details:* ${design.details || "Custom high-quality handcrafting"}\n\n🌟 *These are our designs!* For more designs, full photos & customization, check our boutique catalog link below:\n👉 ${customerLink}\n\nFeel free to share this with your friends & family or reply to place your order! ✨`
      : `✨ *Hello Aruna Creations!* ✨\n\nI am viewing your design on the catalog (*Model:* ${design.modelNumber} - ${design.name}) and want to know price, fabric details, and stitching options! 👗\n\n👉 *Design Link:* ${customerLink}`;

    const url = isAdmin
      ? `https://wa.me/?text=${encodeURIComponent(message)}`
      : `https://wa.me/91${ownerPhoneDigits}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  const handleInterestedClick = async () => {
    const storedCustomerName = typeof window !== "undefined" ? localStorage.getItem("aruna_customer_name") || "Interested Client" : "Interested Client";
    const storedCustomerPhone = typeof window !== "undefined" ? localStorage.getItem("aruna_customer_phone") || "" : "";
    const customerLink = getShareLink();
    const ownerPhoneDigits = getOwnerPhone().replace(/\D/g, "");

    setIsSubmitting(true);
    try {
      await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: storedCustomerName,
          customerPhone: storedCustomerPhone || "Online Client",
          designId: design._id || design.id,
          designModel: design.modelNumber,
          designName: design.name,
          message: `Customer showed interest in ${design.modelNumber} - ${design.name}`,
        }),
      });

      setInterestedSent(true);

      // Trigger WhatsApp message directly to the Boutique Owner's Phone Number
      const msg = `✨ *Hello Aruna Creations!* ✨\n\nI am very *INTERESTED* in this design from your catalog:\n👗 *Design:* ${design.name}\n🔖 *Model Number:* ${design.modelNumber}\n🧵 *Type:* ${design.type.toUpperCase()}${design.customType ? ` (${design.customType})` : ""}\n🎨 *Pattern:* ${design.pattern || "Standard Pattern"}\n\n👤 *My Details:*\n*Name:* ${storedCustomerName}\n*Phone:* ${storedCustomerPhone || "Direct WhatsApp Contact"}\n\n👉 *View Design:* ${customerLink}\n\nPlease share price, fabric details, and stitching availability! 💕`;
      const waUrl = `https://wa.me/91${ownerPhoneDigits}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");

      setTimeout(() => setInterestedSent(false), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl border border-rose-100 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-rose-100/60 bg-rose-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-[#d9778a]">
              {design.modelNumber}
            </span>
            <span className="text-xs font-bold text-stone-700 capitalize">
              {design.type === "other" && design.customType ? design.customType : design.type}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(design);
                }}
                className="p-1.5 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                title="Edit Design"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Main Hero Image */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[selectedImgIndex]}
              alt={design.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            
            {/* Admin Price Badge */}
            {isAdmin && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold shadow-md">
                Estimated: ₹{design.price}
              </div>
            )}
          </div>

          {/* Thumbnails row (as wireframed) */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImgIndex(i)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImgIndex === i
                      ? "border-[#d9778a] ring-2 ring-rose-200"
                      : "border-stone-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Design Specs */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-stone-800 tracking-tight">{design.name}</h3>
            
            {design.pattern && (
              <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100/60">
                <span className="text-[11px] font-semibold text-[#d9778a] uppercase tracking-wider block mb-0.5">
                  Pattern / Neck Style
                </span>
                <p className="text-xs font-medium text-stone-800 leading-relaxed">
                  {design.pattern}
                </p>
              </div>
            )}

            {design.details && (
              <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-100">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-0.5">
                  Fabric & Craft Details
                </span>
                <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                  {design.details}
                </p>
              </div>
            )}
          </div>

          {/* Interested Success Alert */}
          {interestedSent && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! We received your interest. Our boutique master will get in touch with you shortly.</span>
            </div>
          )}
        </div>

        {/* Footer Actions (As specified in user wireframes) */}
        <div className="p-3 bg-stone-50 border-t border-rose-100 flex flex-col gap-2">
          {isAdmin ? (
            /* Admin WhatsApp Share Action */
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Send to Customer via WhatsApp</span>
              </button>
            </div>
          ) : (
            /* Customer Actions: Interested | WhatsApp | Contact */
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isSubmitting || interestedSent}
                onClick={handleInterestedClick}
                className="py-2.5 px-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-[#d9778a] text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Heart className={`w-3.5 h-3.5 ${interestedSent ? "fill-current text-[#d9778a]" : ""}`} />
                <span>{interestedSent ? "Interested!" : "Interested"}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <a
                href="tel:9876543210"
                className="py-2.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
