"use client";

import React, { useState } from "react";
import { DesignData } from "@/types";
import { Sparkles, Share2, Edit3, Trash2, Eye } from "lucide-react";

interface DesignCardProps {
  design: DesignData;
  onViewMore: (design: DesignData) => void;
  onEdit?: (design: DesignData) => void;
  onDelete?: (design: DesignData) => void;
  isAdmin?: boolean;
}

export const DesignCard: React.FC<DesignCardProps> = ({
  design,
  onViewMore,
  onEdit,
  onDelete,
  isAdmin = true,
}) => {
  const [copied, setCopied] = useState(false);

  const getShareLink = () => {
    if (typeof window === "undefined") return "";
    const ownerPhone = localStorage.getItem("aruna_user_phone") || "9876543210";
    return `${window.location.origin}/c?design=${encodeURIComponent(design.modelNumber)}&owner=${encodeURIComponent(ownerPhone)}`;
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const customerLink = getShareLink();
    const text = isAdmin
      ? `✨ *Hello from Aruna Creations!* ✨\n\nHere are the details for our exclusive boutique design:\n👗 *Design Name:* ${design.name}\n🔖 *Model Number:* ${design.modelNumber}\n🧵 *Type:* ${design.type.toUpperCase()}${design.customType ? ` (${design.customType})` : ""}\n🎨 *Pattern:* ${design.pattern || "Designer Tailored Pattern"}\n📝 *Details:* ${design.details || "Custom high-quality handcrafting"}\n\n🌟 *These are our designs!* For more designs, full photos & customization, check our boutique catalog link below:\n👉 ${customerLink}\n\n_(Please wait a few moments if the website is loading)_\n\nFeel free to share this with your friends & family or reply to place your order! ✨`
      : `✨ *Check out this beautiful design from Aruna Creations!* ✨\n\n👗 *Design:* ${design.name} (${design.modelNumber})\n🧵 *Type:* ${design.type.toUpperCase()}${design.customType ? ` (${design.customType})` : ""}\n🎨 *Pattern:* ${design.pattern || "Designer Pattern"}\n\n🌟 View full photos and explore more designer patterns on the catalog link below:\n👉 ${customerLink}\n\n_(Please wait a few moments if the website is loading)_\n\nShare with anyone looking for bespoke boutique designs! 💕`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const customerLink = getShareLink();
    navigator.clipboard.writeText(customerLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onViewMore(design)}
      className="group bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer"
    >
      {/* Image thumbnail container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-rose-50/50">
        {design.images && design.images.length > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={design.images[0]}
            alt={design.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-rose-300">
            <Sparkles className="w-8 h-8" />
          </div>
        )}

        {/* Badge for Type (Embroidery / Stitching / Other) */}
        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-[#d9778a] shadow-xs backdrop-blur-xs border border-rose-100">
          {design.type === "other" && design.customType ? design.customType : design.type}
        </span>

        {/* Admin Price Badge (Visible only to boutique owner as specified) */}
        {isAdmin && design.price > 0 && (
          <span className="absolute bottom-2 right-2 text-xs font-bold px-2 py-0.5 rounded-lg bg-stone-900/80 text-white backdrop-blur-xs shadow-xs">
            Est: ₹{design.price}
          </span>
        )}
      </div>

      {/* Details info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-mono font-bold text-stone-500">{design.modelNumber}</span>
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-stone-800 line-clamp-1 mt-0.5">
            {design.name}
          </h4>
          {design.pattern && (
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
              {design.pattern}
            </p>
          )}
        </div>

        {/* Action bar */}
        <div className="mt-3 pt-2.5 border-t border-rose-50 flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewMore(design);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#d9778a] hover:underline"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View More</span>
          </button>

          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="Share Design via WhatsApp with customer link"
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(design);
                  }}
                  title="Edit Design details & price"
                  className="p-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete design ${design.modelNumber}?`)) onDelete(design);
                  }}
                  title="Delete design"
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-[10px] text-stone-500 hover:text-stone-700 underline"
            >
              {copied ? "Link Copied!" : "Copy Link"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
