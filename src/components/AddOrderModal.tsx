"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DesignData, OrderData } from "@/types";
import { X, Sparkles, Check, ChevronDown } from "lucide-react";

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrder?: OrderData) => void;
  designs: DesignData[];
  initialDraftData?: Record<string, unknown> | null;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  designs,
  initialDraftData,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedDesignId, setSelectedDesignId] = useState("");
  const [designModel, setDesignModel] = useState("");
  const [designName, setDesignName] = useState("");
  const [designType, setDesignType] = useState("embroidery");
  const [designImages, setDesignImages] = useState<string[]>([]);
  
  // Measurements
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [blouseLength, setBlouseLength] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [frontNeck, setFrontNeck] = useState("");
  const [backNeck, setBackNeck] = useState("");
  const [sleeveLength, setSleeveLength] = useState("");
  const [sleeveRound, setSleeveRound] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  // Pricing & Calculations
  const [baseCost, setBaseCost] = useState<string>("");
  const [extraCharges, setExtraCharges] = useState<string>("0");
  const [paidAmount, setPaidAmount] = useState<string>("0");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [showMeasurementGuide, setShowMeasurementGuide] = useState(false);

  // Auto-calculated totals
  const numBase = Number(baseCost) || 0;
  const numExtra = Number(extraCharges) || 0;
  const numPaid = Number(paidAmount) || 0;
  const finalCost = numBase + numExtra;
  const balanceAmount = Math.max(0, finalCost - numPaid);

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setSelectedDesignId("");
    setDesignModel("");
    setDesignName("");
    setDesignType("embroidery");
    setDesignImages([]);
    setBust("");
    setWaist("");
    setHip("");
    setBlouseLength("");
    setShoulder("");
    setFrontNeck("");
    setBackNeck("");
    setSleeveLength("");
    setSleeveRound("");
    setCustomNotes("");
    setBaseCost("");
    setExtraCharges("0");
    setPaidAmount("0");
    setDeliveryDate("");
    setOrderNotes("");
  };

  // Populate data when restoring from drafts or opening fresh
  useEffect(() => {
    if (!isOpen) return;
    if (initialDraftData) {
      const p = initialDraftData;
      setCustomerName((p.customerName as string) || "");
      setCustomerPhone((p.customerPhone as string) || "");
      setCustomerAddress((p.customerAddress as string) || "");
      setSelectedDesignId((p.selectedDesignId as string) || "");
      setDesignModel((p.designModel as string) || "");
      setDesignName((p.designName as string) || "");
      setDesignType((p.designType as string) || "embroidery");
      setDesignImages(Array.isArray(p.designImages) ? (p.designImages as string[]) : []);
      setBust((p.bust as string) || "");
      setWaist((p.waist as string) || "");
      setHip((p.hip as string) || "");
      setBlouseLength((p.blouseLength as string) || "");
      setShoulder((p.shoulder as string) || "");
      setFrontNeck((p.frontNeck as string) || "");
      setBackNeck((p.backNeck as string) || "");
      setSleeveLength((p.sleeveLength as string) || "");
      setSleeveRound((p.sleeveRound as string) || "");
      setCustomNotes((p.customNotes as string) || "");
      setBaseCost((p.baseCost as string) || "");
      setExtraCharges((p.extraCharges as string) || "0");
      setPaidAmount((p.paidAmount as string) || "0");
      setDeliveryDate((p.deliveryDate as string) || "");
      setOrderNotes((p.orderNotes as string) || "");
    } else {
      resetForm();
    }
  }, [isOpen, initialDraftData]);

  // Handle design dropdown select
  const handleSelectDesign = (id: string) => {
    setSelectedDesignId(id);
    const found = designs.find((d) => (d._id || d.id) === id);
    if (found) {
      setDesignModel(found.modelNumber);
      setDesignName(found.name);
      setDesignType(found.type);
      setDesignImages(found.images || []);
      if (!baseCost || Number(baseCost) === 0) {
        setBaseCost(String(found.price || 0));
      }
    }
  };

  // Auto-save draft on closing if any data is entered
  const handleClose = () => {
    if (customerName || customerPhone || selectedDesignId || bust || baseCost) {
      const draftData = {
        customerName,
        customerPhone,
        customerAddress,
        selectedDesignId,
        designModel,
        designName,
        designType,
        designImages,
        bust,
        waist,
        hip,
        blouseLength,
        shoulder,
        frontNeck,
        backNeck,
        sleeveLength,
        sleeveRound,
        customNotes,
        baseCost,
        extraCharges,
        paidAmount,
        deliveryDate,
        orderNotes,
      };
      localStorage.setItem("aruna_draft_order", JSON.stringify(draftData));
      fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftType: "order", data: draftData }),
      }).catch(() => {});
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerName.trim() || !customerPhone || !customerPhone.trim()) {
      alert("Please fill in Customer Name and Phone Number.");
      return;
    }

    const finalDesignModel = designModel || "CUSTOM-ORDER";
    const finalDesignName = designName || "Custom Tailoring / Stitching";

    setLoading(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress ? customerAddress.trim() : "",
        designId: selectedDesignId || undefined,
        designModel: finalDesignModel,
        designName: finalDesignName,
        designType: designType || "embroidery",
        designImages,
        measurements: {
          bust,
          waist,
          hip,
          blouseLength,
          shoulder,
          frontNeck,
          backNeck,
          sleeveLength,
          sleeveRound,
          customNotes,
        },
        baseCost: numBase,
        extraCharges: numExtra,
        finalCost,
        paidAmount: numPaid,
        balanceAmount,
        status: "pending",
        deliveryDate,
        notes: orderNotes,
        orderPhotos: designImages,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create order");
      const data = await res.json();

      // Clean drafts
      localStorage.removeItem("aruna_draft_order");
      fetch("/api/drafts?type=order", { method: "DELETE" }).catch(() => {});

      if (data.order) {
        onSuccess(data.order);
      } else {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl border border-rose-100 shadow-xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header with Draft Button */}
        <div className="px-5 py-4 border-b border-rose-100/70 bg-rose-50/40 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-800 flex items-center gap-1.5">
              <span>🧵 New Customer Order</span>
            </h2>
            <p className="text-[11px] text-stone-500">Custom tailored boutique order</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const draftData = {
                  customerName,
                  customerPhone,
                  customerAddress,
                  selectedDesignId,
                  designModel,
                  designName,
                  designType,
                  designImages,
                  bust,
                  waist,
                  hip,
                  blouseLength,
                  shoulder,
                  frontNeck,
                  backNeck,
                  sleeveLength,
                  sleeveRound,
                  customNotes,
                  baseCost,
                  extraCharges,
                  paidAmount,
                  deliveryDate,
                  orderNotes,
                };
                localStorage.setItem("aruna_draft_order", JSON.stringify(draftData));
                fetch("/api/drafts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ draftType: "order", data: draftData }),
                }).catch(() => {});
                setDraftSavedToast(true);
                setTimeout(() => setDraftSavedToast(false), 2000);
              }}
              className="px-2.5 py-1 text-xs rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors flex items-center gap-1"
              title="Save current order draft"
            >
              <span>Save Draft</span>
            </button>

            <button
              onClick={handleClose}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Draft feedback notification */}
        {draftSavedToast && (
          <div className="bg-emerald-50 text-emerald-700 text-xs px-4 py-1.5 border-b border-emerald-100 flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Order draft saved successfully!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Customer Details */}
          <div className="bg-rose-50/20 p-3 rounded-2xl border border-rose-100/60 space-y-2.5">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              👤 Customer Details
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Delivery Address / Area
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="e.g. Jubilee Hills, Hyderabad"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
              />
            </div>
          </div>

          {/* Design Selection Section */}
          <div className="bg-stone-50/60 p-3 rounded-2xl border border-stone-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                ✨ Design Selection
              </h3>
              <span className="text-[10px] text-stone-400">Dropdown from catalog</span>
            </div>

            <div className="relative">
              <select
                value={selectedDesignId}
                onChange={(e) => handleSelectDesign(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:border-[#d9778a] appearance-none font-medium"
              >
                <option value="">-- Choose Design Model from Designs page --</option>
                {designs.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.modelNumber} - {d.name} ({d.type}) [Est: ₹{d.price}]
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Selected design preview */}
            {designModel && (
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-rose-100">
                {designImages && designImages[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={designImages[0]}
                    alt={designModel}
                    className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-rose-100 text-[#d9778a] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-stone-800 block truncate">{designModel}</span>
                  <p className="text-[11px] text-stone-500 truncate">{designName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Model Size & Measurements */}
          <div className="bg-rose-50/20 p-3 rounded-2xl border border-rose-100/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                📏 Model Size & Measurements
              </h3>
              <button
                type="button"
                onClick={() => setShowMeasurementGuide(!showMeasurementGuide)}
                className="text-[10px] text-[#d9778a] underline font-medium"
              >
                {showMeasurementGuide ? "Standard View" : "Quick Size Fill"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Bust/Chest</label>
                <input
                  type="text"
                  value={bust}
                  onChange={(e) => setBust(e.target.value)}
                  placeholder="36 in"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Waist</label>
                <input
                  type="text"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="30 in"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Hip</label>
                <input
                  type="text"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  placeholder="38 in"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Blouse Length</label>
                <input
                  type="text"
                  value={blouseLength}
                  onChange={(e) => setBlouseLength(e.target.value)}
                  placeholder="14.5 in"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Front Neck</label>
                <input
                  type="text"
                  value={frontNeck}
                  onChange={(e) => setFrontNeck(e.target.value)}
                  placeholder="6.5 in"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Back Neck</label>
                <input
                  type="text"
                  value={backNeck}
                  onChange={(e) => setBackNeck(e.target.value)}
                  placeholder="9 in"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Sleeve Length</label>
                <input
                  type="text"
                  value={sleeveLength}
                  onChange={(e) => setSleeveLength(e.target.value)}
                  placeholder="10 in"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Sleeve Round</label>
                <input
                  type="text"
                  value={sleeveRound}
                  onChange={(e) => setSleeveRound(e.target.value)}
                  placeholder="12 in"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Shoulder</label>
                <input
                  type="text"
                  value={shoulder}
                  onChange={(e) => setShoulder(e.target.value)}
                  placeholder="14 in"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Special Cut / Stitching Notes</label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Princess cut with padded cups, heavy potli latkans..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
              />
            </div>
          </div>

          {/* Pricing & Automatic Calculations */}
          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80 space-y-3">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
              <span>💰 Pricing & Automatic Balance</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={baseCost}
                  onChange={(e) => setBaseCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-1">
                  Extra Amount (₹)
                </label>
                <input
                  type="number"
                  value={extraCharges}
                  onChange={(e) => setExtraCharges(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-amber-200 bg-amber-50/40 focus:outline-hidden focus:border-amber-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-emerald-200 bg-emerald-50/40 focus:outline-hidden focus:border-emerald-400 font-semibold text-emerald-700"
                />
              </div>
            </div>

            {/* Calculated summary tile */}
            <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500 block text-[10px]">Final Cost:</span>
                <span className="font-bold text-stone-800 text-sm">₹{finalCost}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">Paid:</span>
                <span className="font-semibold text-emerald-600">₹{numPaid}</span>
              </div>
              <div className="text-right">
                <span className="text-stone-500 block text-[10px]">Balance Due:</span>
                <span className={`font-bold text-sm ${balanceAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  ₹{balanceAmount}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-600 mb-1">Delivery / Extra Notes</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Urgent bridal delivery"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-rose-100 flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#d9778a] hover:bg-[#c45d72] text-white text-xs font-bold shadow-md shadow-rose-200 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
