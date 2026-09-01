"use client";

import React, { useState, useEffect } from "react";
import { OrderData, DesignData, CustomerData } from "@/types";
import { X, RotateCcw, Trash2, Truck, Sparkles, RefreshCw, Scissors, Users } from "lucide-react";

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemRestored?: () => void;
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({
  isOpen,
  onClose,
  onItemRestored,
}) => {
  const [recycledOrders, setRecycledOrders] = useState<OrderData[]>([]);
  const [recycledDesigns, setRecycledDesigns] = useState<DesignData[]>([]);
  const [recycledCustomers, setRecycledCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "designs" | "customers">("orders");

  const fetchRecycledData = async () => {
    setLoading(true);
    try {
      const [resOrders, resDesigns, resCustomers] = await Promise.all([
        fetch("/api/orders?view=recycle", { cache: "no-store" }),
        fetch("/api/designs?view=recycle", { cache: "no-store" }),
        fetch("/api/customers?view=recycle", { cache: "no-store" }),
      ]);

      const dataOrders = await resOrders.json();
      const dataDesigns = await resDesigns.json();
      const dataCustomers = await resCustomers.json();

      if (dataOrders.orders && Array.isArray(dataOrders.orders)) {
        setRecycledOrders(dataOrders.orders);
      }
      if (dataDesigns.designs && Array.isArray(dataDesigns.designs)) {
        setRecycledDesigns(dataDesigns.designs);
      }
      if (dataCustomers.customers && Array.isArray(dataCustomers.customers)) {
        setRecycledCustomers(dataCustomers.customers);
      }
    } catch (e) {
      console.error("Error loading recycle bin:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecycledData();
    }
  }, [isOpen]);

  // Order Actions
  const handleRestoreOrder = async (order: OrderData) => {
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
      fetchRecycledData();
      if (onItemRestored) onItemRestored();
    } catch (e) {
      alert("Failed to restore order");
    }
  };

  const handlePermanentDeleteOrder = async (order: OrderData) => {
    if (!confirm(`Permanently delete order for ${order.customerName}? This cannot be undone.`)) {
      return;
    }
    try {
      await fetch(`/api/orders?id=${order._id}&permanent=true`, { method: "DELETE" });
      setRecycledOrders((prev) => prev.filter((o) => o._id !== order._id));
      if (onItemRestored) onItemRestored();
    } catch (e) {
      alert("Failed to delete order");
    }
  };

  // Design Actions
  const handleRestoreDesign = async (design: DesignData) => {
    try {
      const id = design._id || design.id;
      await fetch("/api/designs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isDeleted: false,
          isArchived: false,
        }),
      });
      fetchRecycledData();
      if (onItemRestored) onItemRestored();
    } catch (e) {
      alert("Failed to restore design");
    }
  };

  const handlePermanentDeleteDesign = async (design: DesignData) => {
    const id = design._id || design.id;
    if (!confirm(`Permanently delete design "${design.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await fetch(`/api/designs?id=${id}&permanent=true`, { method: "DELETE" });
      setRecycledDesigns((prev) => prev.filter((d) => (d._id || d.id) !== id));
      if (onItemRestored) onItemRestored();
    } catch (e) {
      alert("Failed to delete design");
    }
  };

  // Customer Actions
  const handleRestoreCustomer = async (customer: CustomerData) => {
    try {
      await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: customer._id,
          isDeleted: false,
        }),
      });

      fetchRecycledData();
      if (onItemRestored) onItemRestored();
    } catch (e) {
      alert("Failed to restore customer");
    }
  };

  const handlePermanentDeleteCustomer = async (customer: CustomerData) => {
    if (!confirm(`Permanently delete customer ${customer.name}? This cannot be undone.`)) {
      return;
    }
    try {
      await fetch(`/api/customers?id=${customer._id}&phone=${customer.phone}&permanent=true`, { method: "DELETE" });
      setRecycledCustomers((prev) => prev.filter((c) => c._id !== customer._id));
      if (onItemRestored) onItemRestored();
    } catch (e) {
      alert("Failed to delete customer");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl border border-rose-100 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 bg-rose-50/40 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-800 flex items-center gap-1.5">
              <span>♻️ Boutique Recycle Bin</span>
            </h2>
            <p className="text-[11px] text-stone-500">Delivered history & deleted items restore</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchRecycledData}
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

        {/* Section Tabs: Orders | Designs | Customers */}
        <div className="px-4 pt-3 flex gap-1.5 border-b border-stone-100 pb-2.5 bg-stone-50/40">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === "orders"
                ? "bg-[#d9778a] text-white shadow-2xs"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-rose-50"
            }`}
          >
            <span>Orders ({recycledOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("designs")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === "designs"
                ? "bg-[#d9778a] text-white shadow-2xs"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-rose-50"
            }`}
          >
            <span>Designs ({recycledDesigns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === "customers"
                ? "bg-[#d9778a] text-white shadow-2xs"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-rose-50"
            }`}
          >
            <span>Clients ({recycledCustomers.length})</span>
          </button>
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#d9778a]" />
              Loading history...
            </div>
          ) : activeTab === "orders" ? (
            recycledOrders.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-stone-300" />
                No delivered or deleted orders in recycle bin.
              </div>
            ) : (
              recycledOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-2"
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

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRestoreOrder(order)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore to Home</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePermanentDeleteOrder(order)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
                      title="Purge permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : activeTab === "designs" ? (
            recycledDesigns.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                <Scissors className="w-6 h-6 mx-auto mb-2 text-stone-300" />
                No deleted designs in recycle bin.
              </div>
            ) : (
              recycledDesigns.map((design) => (
                <div
                  key={design._id || design.id}
                  className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    {design.images && design.images[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={design.images[0]}
                        alt={design.name}
                        className="w-12 h-12 object-cover rounded-xl border border-stone-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-rose-100 text-[#d9778a] flex items-center justify-center">
                        <Scissors className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-stone-800">{design.name}</h4>
                      <span className="text-[10px] font-mono text-stone-500">{design.modelNumber}</span>
                      <span className="text-[10px] text-[#d9778a] block capitalize font-medium">{design.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRestoreDesign(design)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePermanentDeleteDesign(design)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
                      title="Purge permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : recycledCustomers.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              <Users className="w-6 h-6 mx-auto mb-2 text-stone-300" />
              No deleted clients in recycle bin.
            </div>
          ) : (
            recycledCustomers.map((cust) => (
              <div
                key={cust._id}
                className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/50 space-y-2 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-stone-800">{cust.name}</h4>
                  <span className="text-[11px] text-stone-500 font-mono">{cust.phone}</span>
                  {cust.address && <p className="text-[10px] text-stone-400 truncate max-w-[180px]">{cust.address}</p>}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRestoreCustomer(cust)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePermanentDeleteCustomer(cust)}
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
            Deleted orders, designs, and clients are preserved here safely.
          </p>
        </div>
      </div>
    </div>
  );
};
