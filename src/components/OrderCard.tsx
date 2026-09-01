"use client";

import React, { useState } from "react";
import { OrderData } from "@/types";
import { Phone, MapPin, Sparkles, ChevronDown, ChevronUp, PlusCircle, CheckCircle2, Clock, Truck, MessageCircle, Trash2 } from "lucide-react";

interface OrderCardProps {
  order: OrderData;
  onAddExtraAmount: (order: OrderData) => void;
  onUpdateStatus?: (order: OrderData, status: OrderData["status"]) => void;
  onDeleteOrder?: (order: OrderData) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAddExtraAmount,
  onUpdateStatus,
  onDeleteOrder,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3 h-3" /> Delivered
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> In Stitching
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100/80 p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Top row: Name, Phone & Status */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <h3 className="font-bold text-base text-stone-800 tracking-tight flex items-center gap-1.5">
            {order.customerName}
          </h3>
          <a
            href={`tel:${order.customerPhone}`}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#d9778a] transition-colors mt-0.5"
          >
            <Phone className="w-3 h-3 text-[#d9778a]" />
            <span>{order.customerPhone}</span>
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          {getStatusBadge(order.status)}
          {onDeleteOrder && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Move order for ${order.customerName} to Recycle Bin?`)) {
                  onDeleteOrder(order);
                }
              }}
              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Order (Move to Recycle Bin)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Address */}
      {order.customerAddress && (
        <div className="flex items-start gap-1 text-xs text-stone-600 mb-3 bg-stone-50/60 p-2 rounded-lg border border-stone-100">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{order.customerAddress}</span>
        </div>
      )}

      {/* Design selected item */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-rose-50/40 border border-rose-100/60 mb-3">
        {order.designImages && order.designImages.length > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={order.designImages[0]}
            alt={order.designModel}
            className="w-12 h-12 object-cover rounded-lg border border-rose-100 shadow-2xs"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-rose-100/60 flex items-center justify-center text-[#d9778a]">
            <Sparkles className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-800 truncate">{order.designModel}</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-[#d9778a]">
              {order.designType}
            </span>
          </div>
          <p className="text-xs text-stone-500 truncate mt-0.5">
            {order.designName || "Custom Boutique Order"}
          </p>
        </div>
      </div>

      {/* Pricing breakdown auto calculation */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-50/80 rounded-xl text-center border border-stone-100 text-xs mb-3">
        <div>
          <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider block">Total Cost</span>
          <span className="font-bold text-stone-800 text-sm">₹{order.finalCost}</span>
          {order.extraCharges > 0 && (
            <span className="text-[10px] text-amber-600 block">(+₹{order.extraCharges})</span>
          )}
        </div>
        <div>
          <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider block">Paid Amount</span>
          <span className="font-bold text-emerald-700 text-sm">₹{order.paidAmount}</span>
        </div>
        <div>
          <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider block">Balance</span>
          <span
            className={`font-bold text-sm ${
              order.balanceAmount > 0 ? "text-rose-600 font-extrabold" : "text-emerald-600"
            }`}
          >
            ₹{order.balanceAmount}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAddExtraAmount(order)}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Amount</span>
          </button>

          {order.status === "completed" && (
            <button
              type="button"
              onClick={() => {
                const phoneDigits = order.customerPhone.replace(/\D/g, "");
                const msg = `✨ *Hello ${order.customerName}!* ✨\n\nGreat news from *Aruna Creations* boutique! 🎉\n\nYour order (*Model:* ${order.designModel} - ${order.designName}) is now **COMPLETED & READY FOR PICKUP / DELIVERY**! 👗🧵\n\n*Total Amount:* ₹${order.finalCost}\n*Paid Amount:* ₹${order.paidAmount}\n*Pending Balance:* ₹${order.balanceAmount}\n\nYou can receive/collect your order soon! Please let us know if you'd like home delivery or in-store pickup. ✨\n\nThank you for choosing Aruna Creations! 💖`;
                window.open(`https://wa.me/91${phoneDigits}?text=${encodeURIComponent(msg)}`, "_blank");
              }}
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors animate-pulse"
              title="Notify customer on WhatsApp that order is ready"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Notify Ready</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-[#d9778a] border border-rose-200/70 hover:bg-rose-100/60 transition-colors"
        >
          <span>{expanded ? "Hide Details" : "View More"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded section: Measurements, Photos, Status selector */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-stone-100 space-y-3 animate-fade-in text-xs">
          {/* Measurements grid */}
          {order.measurements && (
            <div>
              <h4 className="font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <span>📐 Measurements / Sizes:</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-rose-50/30 p-2.5 rounded-xl border border-rose-100/50">
                {order.measurements.bust && (
                  <div><span className="text-stone-500">Bust/Chest:</span> <strong className="text-stone-800">{order.measurements.bust}</strong></div>
                )}
                {order.measurements.waist && (
                  <div><span className="text-stone-500">Waist:</span> <strong className="text-stone-800">{order.measurements.waist}</strong></div>
                )}
                {order.measurements.hip && (
                  <div><span className="text-stone-500">Hip:</span> <strong className="text-stone-800">{order.measurements.hip}</strong></div>
                )}
                {order.measurements.blouseLength && (
                  <div><span className="text-stone-500">Length:</span> <strong className="text-stone-800">{order.measurements.blouseLength}</strong></div>
                )}
                {order.measurements.shoulder && (
                  <div><span className="text-stone-500">Shoulder:</span> <strong className="text-stone-800">{order.measurements.shoulder}</strong></div>
                )}
                {order.measurements.sleeveLength && (
                  <div><span className="text-stone-500">Sleeve:</span> <strong className="text-stone-800">{order.measurements.sleeveLength}</strong></div>
                )}
                {order.measurements.frontNeck && (
                  <div><span className="text-stone-500">Front Neck:</span> <strong className="text-stone-800">{order.measurements.frontNeck}</strong></div>
                )}
                {order.measurements.backNeck && (
                  <div><span className="text-stone-500">Back Neck:</span> <strong className="text-stone-800">{order.measurements.backNeck}</strong></div>
                )}
                {order.measurements.customNotes && (
                  <div className="col-span-2 text-rose-800 italic pt-1">
                    Note: {order.measurements.customNotes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photo gallery */}
          {order.designImages && order.designImages.length > 0 && (
            <div>
              <h4 className="font-semibold text-stone-700 mb-1.5">🖼️ Design Photos</h4>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {order.designImages.map((img, idx) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={idx}
                    src={img}
                    alt={`Photo ${idx + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-stone-200 shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status update buttons */}
          {onUpdateStatus && (
            <div className="pt-2">
              <span className="text-[11px] font-medium text-stone-500 block mb-1.5">Update Order Status:</span>
              <div className="flex flex-wrap gap-1.5">
                {(["pending", "in_progress", "completed", "delivered"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(order, st)}
                    className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                      order.status === st
                        ? "bg-[#d9778a] text-white shadow-2xs font-bold"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
