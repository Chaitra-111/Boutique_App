import { DesignData, OrderData, CustomerData, DraftData } from "@/types";

interface MemoryDB {
  designs: DesignData[];
  orders: OrderData[];
  customers: CustomerData[];
  drafts: DraftData[];
  enquiries: Array<{
    _id: string;
    customerName: string;
    customerPhone: string;
    designModel: string;
    designName: string;
    message?: string;
    createdAt: string;
  }>;
}

declare global {
  // eslint-disable-next-line no-var
  var memoryStorageCache: MemoryDB | undefined;
}

if (!global.memoryStorageCache) {
  global.memoryStorageCache = {
    designs: [],
    orders: [],
    customers: [],
    drafts: [],
    enquiries: [],
  };
}

export const memoryDB = global.memoryStorageCache;
