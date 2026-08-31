"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DraftData } from "@/types";
import { X, FileText, Sparkles, Trash2, ArrowRight } from "lucide-react";

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreOrderDraft: (data: Record<string, unknown>) => void;
  onRestoreDesignDraft: (data: Record<string, unknown>) => void;
}

export const DraftsModal: React.FC<DraftsModalProps> = ({
  isOpen,
  onClose,
  onRestoreOrderDraft,
  onRestoreDesignDraft,
}) => {
  const [orderDraft, setOrderDraft] = useState<DraftData | null>(null);
  const [designDraft, setDesignDraft] = useState<DraftData | null>(null);

  const loadDrafts = useCallback(async () => {
    // LocalStorage check
    const localOrder = localStorage.getItem("aruna_draft_order");
    if (localOrder) {
      try {
        setOrderDraft({ draftType: "order", data: JSON.parse(localOrder) });
      } catch (e) {
        console.error(e);
      }
    } else {
      setOrderDraft(null);
    }

    const localDesign = localStorage.getItem("aruna_draft_design");
    if (localDesign) {
      try {
        setDesignDraft({ draftType: "design", data: JSON.parse(localDesign) });
      } catch (e) {
        console.error(e);
      }
    } else {
      setDesignDraft(null);
    }

    // Backend API check
    try {
      const resOrder = await fetch("/api/drafts?type=order");
      const dOrder = await resOrder.json();
      if (dOrder.draft && !localOrder) {
        setOrderDraft(dOrder.draft);
      }

      const resDesign = await fetch("/api/drafts?type=design");
      const dDesign = await resDesign.json();
      if (dDesign.draft && !localDesign) {
        setDesignDraft(dDesign.draft);
      }
    } catch (e) {
      console.warn("Error fetching remote drafts:", e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadDrafts();
  }, [isOpen, loadDrafts]);

  const clearDraft = async (type: "order" | "design") => {
    if (type === "order") {
      localStorage.removeItem("aruna_draft_order");
      setOrderDraft(null);
      await fetch("/api/drafts?type=order", { method: "DELETE" }).catch(() => {});
    } else {
      localStorage.removeItem("aruna_draft_design");
      setDesignDraft(null);
      await fetch("/api/drafts?type=design", { method: "DELETE" }).catch(() => {});
    }
  };

  if (!isOpen) return null;

  const hasDrafts = Boolean(orderDraft || designDraft);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl border border-rose-100 shadow-xl overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-100/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800">Saved Drafts</h3>
              <p className="text-[11px] text-stone-500">Auto-saved work & crash protection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {!hasDrafts && (
            <div className="text-center py-6 text-stone-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-rose-400" />
              <p className="text-xs font-medium">No saved drafts currently.</p>
              <p className="text-[11px]">When you start creating an order or design, drafts are preserved automatically.</p>
            </div>
          )}

          {/* Order Draft Tile */}
          {orderDraft && (
            <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 space-y-2">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d9778a] bg-rose-100 px-2 py-0.5 rounded-full">
                    Order Draft
                  </span>
                  <h4 className="text-xs font-bold text-stone-800 mt-1">
                    {(orderDraft.data.customerName as string) || "Unnamed Customer"}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Model: {(orderDraft.data.designModel as string) || "Not chosen yet"} | ₹{(orderDraft.data.baseCost as string) || "0"}
                  </p>
                </div>

                <button
                  onClick={() => clearDraft("order")}
                  className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                  title="Discard Draft"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  onRestoreOrderDraft(orderDraft.data);
                  onClose();
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-[#d9778a] hover:bg-[#c45d72] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
              >
                <span>Continue Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Design Draft Tile */}
          {designDraft && (
            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Design Draft
                  </span>
                  <h4 className="text-xs font-bold text-stone-800 mt-1">
                    {(designDraft.data.name as string) || "Untitled Design"}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Model: {(designDraft.data.modelNumber as string) || "N/A"} | Type: {(designDraft.data.type as string) || "embroidery"}
                  </p>
                </div>

                <button
                  onClick={() => clearDraft("design")}
                  className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                  title="Discard Draft"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  onRestoreDesignDraft(designDraft.data);
                  onClose();
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
              >
                <span>Continue Design</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
