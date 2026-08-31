import { Suspense } from "react";
import CustomerPortalClient from "./CustomerPortalClient";

export default function CustomerPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-xs font-semibold text-stone-500">Loading boutique collection...</div>}>
      <CustomerPortalClient />
    </Suspense>
  );
}
