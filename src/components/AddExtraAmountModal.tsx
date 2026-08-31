"use client";

import React, { useState } from "react";
import { OrderData } from "@/types";
import { X, PlusCircle, Check } from "lucide-react";

interface AddExtraAmountModalProps {
  order: OrderData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddExtraAmountModal: React.FC<AddExtraAmountModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [extraAmount, setExtraAmount] = useState<string>("");
  const [additionalPaid, setAdditionalPaid] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const currentExtra = Number(order.extraCharges) || 0;
  const currentPaid = Number(order.paidAmount) || 0;
  const currentBase = Number(order.baseCost) || 0;

  const newAddedExtra = Number(extraAmount) || 0;
  const newAddedPaid = Number(additionalPaid) || 0;

  const updatedTotalExtra = currentExtra + newAddedExtra;
  const updatedFinalCost = currentBase + updatedTotalExtra;
  const updatedTotalPaid = currentPaid + newAddedPaid;
  const updatedBalance = Math.max(0, updatedFinalCost - updatedTotalPaid);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order._id,
          extraCharges: updatedTotalExtra,
          paidAmount: updatedTotalPaid,
          notes: reason ? `${order.notes || ""} | Extra charge reason: ${reason}` : order.notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to update extra amount");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl border border-rose-100 shadow-xl overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-100/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800">Add Extra Delivery / Fitting Charge</h3>
              <p className="text-[11px] text-stone-500">{order.customerName} ({order.designModel})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Add Extra Amount to Order (₹)
            </label>
            <input
              type="number"
              value={extraAmount}
              onChange={(e) => setExtraAmount(e.target.value)}
              placeholder="e.g. 200 (for extra lace/tassels or express delivery)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-400 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Any Customer Payment Received Now? (₹)
            </label>
            <input
              type="number"
              value={additionalPaid}
              onChange={(e) => setAdditionalPaid(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-emerald-400 font-semibold text-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Reason / Remarks
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Express delivery + Extra matching tassels"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
            />
          </div>

          {/* Real-time Calculation Summary */}
          <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200/60 text-xs space-y-1">
            <div className="flex justify-between text-stone-600">
              <span>Updated Total Cost:</span>
              <span className="font-bold text-stone-800">₹{updatedFinalCost}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Total Paid:</span>
              <span>₹{updatedTotalPaid}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-bold border-t border-amber-200/60 pt-1">
              <span>New Balance Amount:</span>
              <span>₹{updatedBalance}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? "Updating..." : "Update Total"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
