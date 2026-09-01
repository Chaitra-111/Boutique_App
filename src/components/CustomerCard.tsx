"use client";

import React, { useState } from "react";
import { CustomerData } from "@/types";
import { Phone, MapPin, ShoppingBag, AlertCircle, MessageCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface CustomerCardProps {
  customer: CustomerData;
  onDeleteCustomer?: (customer: CustomerData) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onDeleteCustomer }) => {
  const [expanded, setExpanded] = useState(false);

  const handleWhatsAppCustomer = () => {
    const text = `Namaste ${customer.name}! Greetings from *Aruna Creations* boutique. Regarding your recent tailoring and boutique orders, please let us know if you need any assistance!`;
    const url = `https://wa.me/91${customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-xs hover:shadow-md transition-shadow">
      {/* Top row: Name & Phone */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-bold text-base text-stone-800 tracking-tight">{customer.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#d9778a]"
            >
              <Phone className="w-3 h-3 text-[#d9778a]" />
              <span>{customer.phone}</span>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${customer.phone}`}
            className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors flex items-center gap-1 text-xs font-semibold"
            title={`Call ${customer.name}`}
          >
            <Phone className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Call</span>
          </a>

          <button
            type="button"
            onClick={handleWhatsAppCustomer}
            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-semibold"
            title={`WhatsApp ${customer.name}`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {onDeleteCustomer && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete customer ${customer.name}?`)) {
                  onDeleteCustomer(customer);
                }
              }}
              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 text-xs font-semibold"
              title={`Delete ${customer.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Address */}
      {customer.address && (
        <div className="flex items-start gap-1 text-xs text-stone-500 mb-3 bg-stone-50/60 p-2 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{customer.address}</span>
        </div>
      )}

      {/* Stats row (as wireframed: No. of orders & Pending amount) */}
      <div className="grid grid-cols-2 gap-2 p-2.5 bg-rose-50/30 rounded-xl border border-rose-100/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-[#d9778a] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">Total Orders</span>
            <span className="font-bold text-stone-800 text-sm">{customer.totalOrders}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              customer.totalBalance > 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">Balance to Pay</span>
            <span
              className={`font-bold text-sm ${
                customer.totalBalance > 0 ? "text-rose-600 font-extrabold" : "text-emerald-700"
              }`}
            >
              ₹{customer.totalBalance}
            </span>
          </div>
        </div>
      </div>

      {/* Toggle recent orders history */}
      {customer.recentOrders && customer.recentOrders.length > 0 && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-stone-500 hover:text-stone-700 py-1"
          >
            <span>Order History ({customer.recentOrders.length})</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="space-y-1.5 mt-1.5 pt-1.5 border-t border-stone-100 text-xs animate-fade-in">
              {customer.recentOrders.map((ord, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-stone-50 text-[11px]"
                >
                  <div>
                    <span className="font-bold text-stone-800">{ord.designModel}</span>
                    <span className="text-stone-400 ml-1.5 capitalize">({ord.designType})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-700 font-medium">₹{ord.finalCost}</span>
                    {ord.balanceAmount && ord.balanceAmount > 0 ? (
                      <span className="text-rose-600 font-bold ml-1.5">Due: ₹{ord.balanceAmount}</span>
                    ) : (
                      <span className="text-emerald-600 ml-1.5">Cleared</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
