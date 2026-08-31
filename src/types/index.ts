export interface MeasurementFields {
  bust?: string;
  waist?: string;
  hip?: string;
  blouseLength?: string;
  shoulder?: string;
  frontNeck?: string;
  backNeck?: string;
  sleeveLength?: string;
  sleeveRound?: string;
  customNotes?: string;
}

export interface DesignData {
  _id?: string;
  id?: string;
  name: string;
  modelNumber: string;
  type: "embroidery" | "stitching" | "other";
  customType?: string;
  pattern: string;
  details: string;
  price: number;
  images: string[];
  createdAt?: string;
}

export interface OrderData {
  _id?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  designId?: string;
  designModel: string;
  designName: string;
  designType: string;
  designImages: string[];
  measurements: MeasurementFields;
  baseCost: number;
  extraCharges: number;
  finalCost: number;
  paidAmount: number;
  balanceAmount: number;
  status: "pending" | "in_progress" | "completed" | "delivered";
  deliveryDate?: string;
  notes?: string;
  orderPhotos?: string[];
  createdAt?: string;
}

export interface CustomerData {
  _id?: string;
  name: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalBalance: number;
  totalBilled: number;
  recentOrders?: Partial<OrderData>[];
}

export interface DraftData {
  draftType: "order" | "design";
  data: Record<string, unknown>;
  updatedAt?: string;
}
