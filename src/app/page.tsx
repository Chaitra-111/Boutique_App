"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { OrderCard } from "@/components/OrderCard";
import { DesignCard } from "@/components/DesignCard";
import { CustomerCard } from "@/components/CustomerCard";
import { AddOrderModal } from "@/components/AddOrderModal";
import { AddDesignModal } from "@/components/AddDesignModal";
import { AddExtraAmountModal } from "@/components/AddExtraAmountModal";
import { ViewDesignModal } from "@/components/ViewDesignModal";
import { DraftsModal } from "@/components/DraftsModal";
import { LoginView } from "@/components/LoginView";
import { OrderData, DesignData, CustomerData } from "@/types";
import { Plus, Search, Scissors, PhoneCall, RefreshCw, Sparkles } from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<{ name: string; phone: string; role: "admin" | "customer" } | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "design" | "customer">("home");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [designs, setDesigns] = useState<DesignData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [orderDraftToRestore, setOrderDraftToRestore] = useState<Record<string, unknown> | null>(null);
  const [isAddDesignOpen, setIsAddDesignOpen] = useState(false);
  const [designDraftToRestore, setDesignDraftToRestore] = useState<Record<string, unknown> | null>(null);
  const [editingDesign, setEditingDesign] = useState<DesignData | null>(null);
  const [selectedExtraOrder, setSelectedExtraOrder] = useState<OrderData | null>(null);
  const [selectedViewDesign, setSelectedViewDesign] = useState<DesignData | null>(null);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [hasDrafts, setHasDrafts] = useState(false);

  // Filters & Search
  const [designCategoryFilter, setDesignCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Check login on client
  useEffect(() => {
    const savedName = localStorage.getItem("aruna_user_name");
    const savedPhone = localStorage.getItem("aruna_user_phone");
    const savedRole = (localStorage.getItem("aruna_role") as "admin" | "customer") || "admin";

    if (savedName && savedPhone) {
      setUser({ name: savedName, phone: savedPhone, role: savedRole });
    }
  }, []);

  // Check drafts
  const checkDraftsStatus = useCallback(() => {
    const localOrder = localStorage.getItem("aruna_draft_order");
    const localDesign = localStorage.getItem("aruna_draft_design");
    setHasDrafts(Boolean(localOrder || localDesign));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Seed if necessary
      await fetch("/api/seed").catch(() => {});

      const [resOrders, resDesigns, resCustomers] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/designs", { cache: "no-store" }),
        fetch("/api/customers", { cache: "no-store" }),
      ]);

      const dataOrders = await resOrders.json();
      const dataDesigns = await resDesigns.json();
      const dataCustomers = await resCustomers.json();

      if (dataOrders.orders) setOrders(dataOrders.orders);
      if (dataDesigns.designs) setDesigns(dataDesigns.designs);
      if (dataCustomers.customers) setCustomers(dataCustomers.customers);
    } catch (e) {
      console.error("Fetch data error:", e);
    } finally {
      setLoading(false);
      checkDraftsStatus();
    }
  }, [checkDraftsStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateOrderStatus = async (order: OrderData, status: OrderData["status"]) => {
    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order._id, status }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDesign = async (design: DesignData) => {
    try {
      const id = design._id || design.id;
      await fetch(`/api/designs?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <LoginView
        role="admin"
        onLoginSuccess={(u) => {
          setUser(u);
        }}
      />
    );
  }

  // Filter designs
  const filteredDesigns = designs.filter((d) => {
    const matchesCategory =
      designCategoryFilter === "all" || d.type === designCategoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.pattern.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 font-sans text-stone-800">
      {/* Navbar with brand, draft icon, and tabs */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        hasDrafts={hasDrafts}
        onOpenDrafts={() => setIsDraftsOpen(true)}
        userRole="admin"
        onSwitchRole={() => {
          window.location.href = "/c";
        }}
      />

      {/* Main Mobile-First Shell (max-w-md matching wireframes) */}
      <main className="max-w-md mx-auto px-4 pt-3 space-y-4">
        {/* Tab 1: Home (Orders) */}
        {activeTab === "home" && (
          <section className="space-y-3 animate-fade-in">
            {/* Header & Quick stats */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-800">Boutique Orders</h2>
                <p className="text-xs text-stone-500">Live order status & auto balance calculations</p>
              </div>
              <button
                onClick={fetchData}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                title="Refresh orders"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-rose-100/80 shadow-xs space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-[#d9778a] flex items-center justify-center">
                  <Scissors className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-stone-700">No active orders yet</h3>
                <p className="text-xs text-stone-500">
                  Tap the button below to take measurements and add a new custom order.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddOrderOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d9778a] text-white text-xs font-bold shadow-md shadow-rose-200"
                >
                  <Plus className="w-4 h-4" /> Add First Order
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, idx) => (
                  <OrderCard
                    key={order._id || idx}
                    order={order}
                    onAddExtraAmount={(ord) => setSelectedExtraOrder(ord)}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Design Page */}
        {activeTab === "design" && (
          <section className="space-y-3 animate-fade-in">
            {/* Header & Filter Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-800">Design Catalog</h2>
                  <p className="text-xs text-stone-500">Embroidery, stitching & bespoke styles</p>
                </div>
                <span className="text-xs font-mono font-bold bg-rose-100 text-[#d9778a] px-2 py-0.5 rounded-full">
                  {designs.length} Designs
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search model number or pattern..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              {/* Category Pills (Embroidery / Stitching / Other / All) */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(["all", "embroidery", "stitching", "other"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDesignCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                      designCategoryFilter === cat
                        ? "bg-[#d9778a] text-white shadow-xs"
                        : "bg-white text-stone-600 border border-stone-200 hover:bg-rose-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Designs Grid (2 Columns on mobile as sketched) */}
            {filteredDesigns.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-rose-100/80 shadow-xs space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-[#d9778a] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-stone-700">No designs added yet</h3>
                <p className="text-xs text-stone-500">
                  Upload your boutique embroidery patterns, stitching models & bridal styles from your device.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDesign(null);
                    setIsAddDesignOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d9778a] text-white text-xs font-bold shadow-md shadow-rose-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add First Design
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredDesigns.map((design, idx) => (
                  <DesignCard
                    key={design._id || design.id || idx}
                    design={design}
                    isAdmin={true}
                    onViewMore={(d) => setSelectedViewDesign(d)}
                    onEdit={(d) => {
                      setEditingDesign(d);
                      setIsAddDesignOpen(true);
                    }}
                    onDelete={handleDeleteDesign}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Customer Section */}
        {activeTab === "customer" && (
          <section className="space-y-3 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-800">Customer Directory</h2>
                  <p className="text-xs text-stone-500">Track orders, pending balances & direct contacts</p>
                </div>
                <span className="text-xs font-mono font-bold bg-rose-100 text-[#d9778a] px-2 py-0.5 rounded-full">
                  {customers.length} Clients
                </span>
              </div>

              {/* Customer Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="customer-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer by name or phone number..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>
            </div>

            {customers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-rose-100/80 shadow-xs space-y-2">
                <p className="text-xs text-stone-500">No customer records yet. Customers are automatically organized when orders are created.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customers
                  .filter((c) => {
                    if (!searchQuery) return true;
                    return (
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.phone.includes(searchQuery)
                    );
                  })
                  .map((cust, idx) => (
                    <CustomerCard key={cust._id || idx} customer={cust} />
                  ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Floating Bottom Action Buttons (Matching wireframe) */}
      {(activeTab === "home" || activeTab === "design") && (
        <div className="fixed bottom-3 inset-x-0 max-w-md mx-auto px-4 z-30 flex justify-center">
          {activeTab === "home" && (
            <button
              type="button"
              onClick={() => setIsAddOrderOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#d9778a] hover:bg-[#c45d72] text-white text-sm font-bold shadow-lg shadow-rose-300 transition-all flex items-center justify-center gap-2 border border-white/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Order</span>
            </button>
          )}

          {activeTab === "design" && (
            <button
              type="button"
              onClick={() => {
                setEditingDesign(null);
                setIsAddDesignOpen(true);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#d9778a] hover:bg-[#c45d72] text-white text-sm font-bold shadow-lg shadow-rose-300 transition-all flex items-center justify-center gap-2 border border-white/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Design</span>
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <AddOrderModal
        isOpen={isAddOrderOpen}
        initialDraftData={orderDraftToRestore}
        onClose={() => {
          setIsAddOrderOpen(false);
          setOrderDraftToRestore(null);
          checkDraftsStatus();
        }}
        onSuccess={() => {
          fetchData();
          setOrderDraftToRestore(null);
          checkDraftsStatus();
        }}
        designs={designs}
      />

      <AddDesignModal
        isOpen={isAddDesignOpen}
        editDesign={editingDesign}
        initialDraftData={designDraftToRestore}
        onClose={() => {
          setIsAddDesignOpen(false);
          setEditingDesign(null);
          setDesignDraftToRestore(null);
          checkDraftsStatus();
        }}
        onSuccess={(savedDesign) => {
          if (savedDesign) {
            setDesigns((prev) => {
              const targetId = savedDesign._id || savedDesign.id;
              const idx = prev.findIndex((d) => (d._id || d.id) === targetId);
              if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = savedDesign;
                return updated;
              }
              return [savedDesign, ...prev];
            });
          }
          // Automatically switch to Design tab so owner immediately sees their newly added design
          setActiveTab("design");
          setEditingDesign(null);
          setDesignDraftToRestore(null);
          fetchData();
          checkDraftsStatus();
        }}
      />

      <AddExtraAmountModal
        isOpen={Boolean(selectedExtraOrder)}
        order={selectedExtraOrder}
        onClose={() => setSelectedExtraOrder(null)}
        onSuccess={fetchData}
      />

      <ViewDesignModal
        isOpen={Boolean(selectedViewDesign)}
        design={selectedViewDesign}
        isAdmin={true}
        onClose={() => setSelectedViewDesign(null)}
        onEdit={(d) => {
          setSelectedViewDesign(null);
          setEditingDesign(d);
          setIsAddDesignOpen(true);
        }}
      />

      <DraftsModal
        isOpen={isDraftsOpen}
        onClose={() => {
          setIsDraftsOpen(false);
          checkDraftsStatus();
        }}
        onRestoreOrderDraft={(data) => {
          setOrderDraftToRestore(data);
          setIsAddOrderOpen(true);
        }}
        onRestoreDesignDraft={(data) => {
          setEditingDesign(null);
          setDesignDraftToRestore(data);
          setIsAddDesignOpen(true);
        }}
      />
    </div>
  );
}
