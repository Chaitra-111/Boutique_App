"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DesignData } from "@/types";
import { X, ImagePlus, Sparkles, Trash2, Check, CloudUpload } from "lucide-react";

interface AddDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editDesign?: DesignData | null;
  initialDraftData?: Record<string, unknown> | null;
}

export const AddDesignModal: React.FC<AddDesignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editDesign,
  initialDraftData,
}) => {
  const [name, setName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [type, setType] = useState<"embroidery" | "stitching" | "other">("embroidery");
  const [customType, setCustomType] = useState("");
  const [pattern, setPattern] = useState("");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  const resetForm = () => {
    setName("");
    setModelNumber("");
    setType("embroidery");
    setCustomType("");
    setPattern("");
    setDetails("");
    setPrice("");
    setImages([]);
    setImageUrlInput("");
  };

  // Initialize data or drafts
  useEffect(() => {
    if (!isOpen) return;
    if (editDesign) {
      setName(editDesign.name || "");
      setModelNumber(editDesign.modelNumber || "");
      setType(editDesign.type || "embroidery");
      setCustomType(editDesign.customType || "");
      setPattern(editDesign.pattern || "");
      setDetails(editDesign.details || "");
      setPrice(editDesign.price ? String(editDesign.price) : "");
      setImages(editDesign.images || []);
    } else if (initialDraftData) {
      const parsed = initialDraftData;
      setName((parsed.name as string) || "");
      setModelNumber((parsed.modelNumber as string) || "");
      setType((parsed.type as "embroidery" | "stitching" | "other") || "embroidery");
      setCustomType((parsed.customType as string) || "");
      setPattern((parsed.pattern as string) || "");
      setDetails((parsed.details as string) || "");
      setPrice((parsed.price as string) || "");
      setImages(Array.isArray(parsed.images) ? (parsed.images as string[]) : []);
    } else {
      resetForm();
    }
  }, [editDesign, isOpen, initialDraftData]);

  // Auto-save draft on closing
  const handleClose = () => {
    if (!editDesign && (name || modelNumber || pattern || details || price || images.length > 0)) {
      const draftData = {
        name,
        modelNumber,
        type,
        customType,
        pattern,
        details,
        price,
        images,
      };
      localStorage.setItem("aruna_draft_design", JSON.stringify(draftData));
      fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftType: "design", data: draftData }),
      }).catch(() => {});
    }
    onClose();
  };

  // Save to drafts on change
  const saveDraft = useCallback(() => {
    if (editDesign) return;
    const draftData = {
      name,
      modelNumber,
      type,
      customType,
      pattern,
      details,
      price,
      images,
    };
    localStorage.setItem("aruna_draft_design", JSON.stringify(draftData));
    
    // Sync with backend API
    fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftType: "design", data: draftData }),
    }).catch((e) => console.warn(e));

    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2000);
  }, [editDesign, name, modelNumber, type, customType, pattern, details, price, images]);

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    let processed = 0;
    const total = files.length;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Optimized thumbnail & upload resolution (max 900px, 0.78 quality - ultra fast)
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 900;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.78);
            setImages((prev) => [...prev, compressed]);
          } else {
            setImages((prev) => [...prev, event.target!.result as string]);
          }

          processed++;
          if (processed >= total) {
            setIsCompressing(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !modelNumber) {
      alert("Please provide both Design Name and Model Number");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        modelNumber: modelNumber.toUpperCase(),
        type,
        customType: type === "other" ? customType : "",
        pattern,
        details,
        price: Number(price) || 0,
        images: images.length > 0 ? images : [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
        ],
      };

      const url = "/api/designs";
      const method = editDesign ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDesign ? { ...payload, id: editDesign._id || editDesign.id } : payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save design");
      }

      // Clear draft on success
      if (!editDesign) {
        localStorage.removeItem("aruna_draft_design");
        fetch("/api/drafts?type=design", { method: "DELETE" }).catch(() => {});
      }

      onSuccess();
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
      <div className="bg-white w-full max-w-md rounded-3xl border border-rose-100 shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header with Draft button */}
        <div className="px-5 py-4 border-b border-rose-100/70 bg-rose-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-[#d9778a] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-800">
                {editDesign ? "Edit Design Model" : "Add New Design"}
              </h2>
              <p className="text-[11px] text-stone-500">Catalog & Boutique Specifications</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editDesign && (
              <button
                type="button"
                onClick={saveDraft}
                className="px-2.5 py-1 text-xs rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors flex items-center gap-1"
                title="Save current inputs to Draft"
              >
                <span>Save Draft</span>
              </button>
            )}

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
              <Check className="w-3.5 h-3.5" /> Draft saved to memory & device
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Images Section */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Design Photos / Sketches (Multiple)
            </label>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-2 mb-2.5">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-rose-100 group shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Tile */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-rose-200 hover:border-[#d9778a] bg-rose-50/40 flex flex-col items-center justify-center text-stone-400 hover:text-[#d9778a] cursor-pointer transition-colors p-2 text-center">
                {isCompressing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#d9778a] border-t-transparent rounded-full animate-spin mb-1" />
                    <span className="text-[10px] font-bold text-[#d9778a]">Optimizing...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium leading-tight">Upload Images</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* URL input fallback */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste image URL..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Type Selection (Embroidery, Stitching, Other) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Design Type / Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["embroidery", "stitching", "other"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all capitalize ${
                    type === t
                      ? "bg-[#d9778a] text-white border-[#d9778a] shadow-xs"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-rose-50/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {type === "other" && (
              <div className="mt-2 animate-fade-in">
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Specify Custom Type (e.g. Indo-Western, Saree Draping)..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
                />
              </div>
            )}
          </div>

          {/* Model & Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Model / Design # <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. AC-EMB-108"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a] uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Design Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bridal Zardosi Blouse"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
              />
            </div>
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Pattern / Neckline Style
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. Sweetheart Neck with Peacock Maggam Work"
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a]"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Design Details & Fabric Notes
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Pure silk fabric, micro pearl borders, elbow-length sleeves with heavy buttis..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a] resize-none"
            />
          </div>

          {/* Estimate Price */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Estimate Price (₹) <span className="text-[10px] text-stone-400 font-normal">(Visible only to boutique owner)</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 3500"
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#d9778a] font-semibold text-stone-800"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-rose-100 flex gap-2">
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
              {loading ? "Saving..." : editDesign ? "Update Design" : "Save Design"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
