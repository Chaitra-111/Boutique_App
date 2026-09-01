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
import { RecycleBinModal } from "@/components/RecycleBinModal";
import { LoginView } from "@/components/LoginView";
import { InstallPwaPrompt } from "@/components/InstallPwaPrompt";
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
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [hasDrafts, setHasDrafts] = useState(false);

  // Filters & Search
  const [designCategoryFilter, setDesignCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Restore saved active tab on load
  useEffect(() => {
    const savedTab = localStorage.getItem("aruna_active_tab") as "home" | "design" | "customer";
    if (savedTab && ["home", "design", "customer"].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: "home" | "design" | "customer") => {
    setActiveTab(tab);
    localStorage.setItem("aruna_active_tab", tab);
  };

  // Check if this app was installed as customer-mode (from shared link)
  // If so, redirect to customer portal automatically
  const [isCustomerDevice, setIsCustomerDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const installedAsCustomer = localStorage.getItem("aruna_installed_as_customer");
      const appMode = localStorage.getItem("aruna_app_mode");
      if (installedAsCustomer === "true" || appMode === "customer") {
        // Check if there's an existing admin session — don't redirect if owner is logged in
        const existingAdminName = localStorage.getItem("aruna_user_name");
        const existingAdminRole = localStorage.getItem("aruna_role");
        if (!existingAdminName || existingAdminRole !== "admin") {
          setIsCustomerDevice(true);
          window.location.href = "/c";
          return;
        }
      }
    }
  }, []);

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
    let localCachedDesigns: DesignData[] = [];
    let localCachedOrders: OrderData[] = [];
    let localCachedCustomers: CustomerData[] = [];

    if (typeof window !== "undefined") {
      try {
        const cachedDesigns = localStorage.getItem("aruna_saved_designs_cache");
        if (cachedDesigns) {
          const parsed = JSON.parse(cachedDesigns);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localCachedDesigns = parsed;
            setDesigns(parsed);
          }
        }

        const cachedOrders = localStorage.getItem("aruna_saved_orders_cache");
        if (cachedOrders) {
          const parsed = JSON.parse(cachedOrders);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localCachedOrders = parsed;
            setOrders(parsed);
          }
        }

        const cachedCustomers = localStorage.getItem("aruna_saved_customers_cache");
        if (cachedCustomers) {
          const parsed = JSON.parse(cachedCustomers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localCachedCustomers = parsed;
            setCustomers(parsed);
          }
        }
      } catch (e) {
        console.warn("Local cache hydration notice:", e);
      }
    }

    try {
      const [resOrders, resDesigns, resCustomers] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }).catch(() => null),
        fetch("/api/designs", {
          cache: "no-store",
          headers: {
            "x-client-designs": encodeURIComponent(JSON.stringify(localCachedDesigns.slice(0, 20))),
          },
        }).catch(() => null),
        fetch("/api/customers", { cache: "no-store" }).catch(() => null),
      ]);

      if (resOrders && resOrders.ok) {
        const dataOrders = await resOrders.json();
        if (dataOrders.orders && Array.isArray(dataOrders.orders)) {
          if (dataOrders.orders.length > 0) {
            setOrders(dataOrders.orders);
            localStorage.setItem("aruna_saved_orders_cache", JSON.stringify(dataOrders.orders));
          } else if (localCachedOrders.length > 0) {
            setOrders(localCachedOrders);
            // Re-sync local orders to server
            localCachedOrders.forEach((o) => {
              fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(o),
              }).catch(() => {});
            });
          }
        }
      }

      if (resDesigns && resDesigns.ok) {
        const dataDesigns = await resDesigns.json();
        if (dataDesigns.designs && Array.isArray(dataDesigns.designs)) {
          if (dataDesigns.designs.length > 0) {
            setDesigns(dataDesigns.designs);
            localStorage.setItem("aruna_saved_designs_cache", JSON.stringify(dataDesigns.designs));
          } else if (localCachedDesigns.length > 0) {
            setDesigns(localCachedDesigns);
            localCachedDesigns.forEach((d) => {
              fetch("/api/designs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(d),
              }).catch(() => {});
            });
          }
        }
      }

      if (resCustomers && resCustomers.ok) {
        const dataCustomers = await resCustomers.json();
        if (dataCustomers.customers && Array.isArray(dataCustomers.customers)) {
          if (dataCustomers.customers.length > 0) {
            setCustomers(dataCustomers.customers);
            localStorage.setItem("aruna_saved_customers_cache", JSON.stringify(dataCustomers.customers));
          } else if (localCachedCustomers.length > 0) {
            setCustomers(localCachedCustomers);
          }
        }
      }
    } catch (e) {
      console.error("Fetch data error:", e);
      if (localCachedDesigns.length > 0) setDesigns(localCachedDesigns);
      if (localCachedOrders.length > 0) setOrders(localCachedOrders);
      if (localCachedCustomers.length > 0) setCustomers(localCachedCustomers);
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
      // If delivered, remove from active list immediately
      if (status === "delivered") {
        setOrders((prev) => {
          const updated = prev.filter((o) => o._id !== order._id);
          localStorage.setItem("aruna_saved_orders_cache", JSON.stringify(updated));
          return updated;
        });
      }
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOrder = async (order: OrderData) => {
    try {
      const id = order._id;
      if (!id) return;
      await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      setOrders((prev) => {
        const updated = prev.filter((o) => o._id !== id);
        localStorage.setItem("aruna_saved_orders_cache", JSON.stringify(updated));
        return updated;
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCustomer = async (customer: CustomerData) => {
    try {
      const id = customer._id;
      const phone = customer.phone;
      await fetch(`/api/customers?id=${id || ""}&phone=${phone || ""}`, { method: "DELETE" });
      setCustomers((prev) => {
        const updated = prev.filter((c) => c._id !== id && c.phone !== phone);
        localStorage.setItem("aruna_saved_customers_cache", JSON.stringify(updated));
        return updated;
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
      setDesigns((prev) => {
        const updated = prev.filter((d) => (d._id || d.id) !== id);
        localStorage.setItem("aruna_saved_designs_cache", JSON.stringify(updated));
        return updated;
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    // If this device is in customer mode, show a clear message
    if (isCustomerDevice) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-rose-100/90 shadow-xl overflow-hidden p-6 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100/80 text-[#d9778a] flex items-center justify-center shadow-inner">
              <Scissors className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-extrabold text-stone-800">Owner Access Only</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              🔐 This login page is only for <strong>Aruna Creations boutique owners</strong>.
              <br /><br />
              As a customer, please use the <strong>Customer Portal</strong> to browse our exclusive bridal &amp; designer collection, view designs, and contact us.
            </p>
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => { window.location.href = "/c"; }}
                className="w-full py-2.5 rounded-xl bg-[#d9778a] text-white text-xs font-bold shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Open Customer Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  // Allow owner override: clear customer mode flag
                  localStorage.removeItem("aruna_installed_as_customer");
                  localStorage.removeItem("aruna_app_mode");
                  setIsCustomerDevice(false);
                }}
                className="w-full py-2 rounded-xl bg-stone-100 text-stone-600 text-[11px] font-medium hover:bg-stone-200 transition-colors"
              >
                I am the Boutique Owner — Login as Admin
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <LoginView
        role="admin"
        onLoginSuccess={(u) => {
          // When owner logs in, clear any customer mode flags
          localStorage.removeItem("aruna_installed_as_customer");
          localStorage.removeItem("aruna_app_mode");
          setUser(u);
        }}
      />
    );
  }

  // Filter designs safely
  const filteredDesigns = designs.filter((d) => {
    const matchesCategory =
      designCategoryFilter === "all" || d.type === designCategoryFilter;
    const cleanSearch = (searchQuery || "").trim().toLowerCase();
    const matchesSearch =
      cleanSearch === "" ||
      (d.name && d.name.toLowerCase().includes(cleanSearch)) ||
      (d.modelNumber && d.modelNumber.toLowerCase().includes(cleanSearch)) ||
      (d.pattern && d.pattern.toLowerCase().includes(cleanSearch)) ||
      (d.details && d.details.toLowerCase().includes(cleanSearch));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 font-sans text-stone-800">
      {/* Install PWA Prompt */}
      <InstallPwaPrompt />

      {/* Navbar with brand, draft icon, recycle bin, and tabs */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasDrafts={hasDrafts}
        onOpenDrafts={() => setIsDraftsOpen(true)}
        onOpenRecycle={() => setIsRecycleOpen(true)}
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
                    onDeleteOrder={handleDeleteOrder}
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
                    <CustomerCard
                      key={cust._id || idx}
                      customer={cust}
                      onDeleteCustomer={handleDeleteCustomer}
                    />
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
        onSuccess={(newOrd) => {
          if (newOrd) {
            setOrders((prev) => {
              const updated = [newOrd, ...prev.filter((o) => o._id !== newOrd._id)];
              try {
                localStorage.setItem("aruna_saved_orders_cache", JSON.stringify(updated));
              } catch (e) {
                console.warn(e);
              }
              return updated;
            });
          }
          handleTabChange("home");
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
              let updated: DesignData[];
              if (idx !== -1) {
                updated = [...prev];
                updated[idx] = savedDesign;
              } else {
                updated = [savedDesign, ...prev];
              }
              try {
                localStorage.setItem("aruna_saved_designs_cache", JSON.stringify(updated));
              } catch (e) {
                console.warn(e);
              }
              return updated;
            });
          }
          // Automatically switch to Design tab so owner immediately sees their newly added design
          handleTabChange("design");
          fetchData();
          setEditingDesign(null);
          setDesignDraftToRestore(null);
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

      <RecycleBinModal
        isOpen={isRecycleOpen}
        onClose={() => setIsRecycleOpen(false)}
        onItemRestored={() => {
          fetchData();
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
          setDesignDraftToRestore(data);
          setIsAddDesignOpen(true);
        }}
      />
    </div>
  );
}
