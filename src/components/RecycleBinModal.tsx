"use client";

import React, { useState, useEffect } from "react";
import { OrderData } from "@/types";
import { X, RotateCcw, Trash2, CheckCircle2, Truck, Sparkles, RefreshCw } from "lucide-react";

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderRestored?: () => void;
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({
  isOpen,
  onClose,
  onOrderRestored,
}) => {
  const [recycledOrders, setRecycledOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "delivered" | "deleted">("all");

  const fetchRecycled = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders?view=recycle", { cache: "no-store" });
      const data = await res.json();
      if (data.orders && Array.isArray(data.orders)) {
        setRecycledOrders(data.orders);
      }
    } catch (e) {
      console.error("Error loading recycle bin:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecycled();
    }
  }, [isOpen]);

  const handleRestore = async (order: OrderData) => {
    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order._id,
          isDeleted: false,
          isArchived: false,
          status: "in_progress",
        }),
      });
      fetchRecycled();
      if (onOrderRestored) onOrderRestored();
    } catch (e) {
      alert("Failed to restore order");
    }
  };

  const handlePermanentDelete = async (order: OrderData) => {
    if (!confirm(`Are you sure you want to permanently purge order for ${order.customerName}? This cannot be undone.`)) {
      return;
    }
    try {
      await fetch(`/api/orders?id=${order._id}&permanent=true`, { method: "DELETE" });
      setRecycledOrders((prev) => prev.filter((o) => o._id !== order._id));
      if (onOrderRestored) onOrderRestored();
    } catch (e) {
      alert("Failed to purge order");
    }
  };

  if (!isOpen) return null;

  const filtered = recycledOrders.filter((o) => {
    if (activeFilter === "delivered") return o.status === "delivered";
    if (activeFilter === "deleted") return o.isDeleted || o.isArchived;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl border border-rose-100 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 bg-rose-50/40 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-800 flex items-center gap-1.5">
              <span>♻️ Recycle & Delivered Orders</span>
            </h2>
            <p className="text-[11px] text-stone-500">Delivered history & deleted orders restore</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchRecycled}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pt-3 flex gap-1.5 border-b border-stone-100 pb-2.5">
          {(["all", "delivered", "deleted"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                activeFilter === tab
                  ? "bg-[#d9778a] text-white shadow-2xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tab === "all" ? `All (${recycledOrders.length})` : tab}
            </button>
          ))}
        </div>

        {/* List of Orders */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#d9778a]" />
              Loading history...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-stone-300" />
              No archived or delivered orders in recycle bin.
            </div>
          ) : (
            filtered.map((order) => (
              <div
                key={order._id}
                className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-2 relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-800">{order.customerName}</h4>
                    <span className="text-[11px] text-stone-500 font-mono">{order.customerPhone}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      order.status === "delivered"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {order.status === "delivered" ? (
                      <>
                        <Truck className="w-3 h-3" /> Delivered
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3" /> Deleted
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 bg-white p-2 rounded-xl border border-stone-100">
                  <div>
                    <span className="font-semibold text-stone-800">{order.designModel}</span>
                    <span className="text-[10px] text-stone-400 ml-1.5">{order.designName}</span>
                  </div>
                  <span className="font-bold text-[#d9778a]">₹{order.finalCost}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleRestore(order)}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore to Home</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePermanentDelete(order)}
                    className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
                    title="Purge permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-rose-100 text-center">
          <p className="text-[10px] text-stone-500">
            Delivered orders & accidentally deleted orders are preserved safely here.
          </p>
        </div>
      </div>
    </div>
  );
};
