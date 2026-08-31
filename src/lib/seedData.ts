export interface DesignItem {
  id: string;
  name: string;
  modelNumber: string;
  type: "embroidery" | "stitching" | "other";
  customType?: string;
  pattern: string;
  details: string;
  price: number;
  images: string[];
}

export const INITIAL_DESIGNS: DesignItem[] = [
  {
    id: "des-101",
    name: "Royal Zardosi Bridal Blouse",
    modelNumber: "AC-EMB-101",
    type: "embroidery",
    pattern: "Peacock Motif with Heavy Cutwork Border",
    details: "Intricate gold zari, hand-embroidery with pearls and stones, sweetheart neckline, elbow-length sleeves with heavy buttis.",
    price: 4800,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "des-102",
    name: "Aari Work Pastel Pink Blouse",
    modelNumber: "AC-EMB-102",
    type: "embroidery",
    pattern: "Floral Jaal with Thread & Sequin Work",
    details: "Pastel blush silk blouse with micro mirror detailing, scalloped hemline, and dori latkan back.",
    price: 3500,
    images: [
      "https://images.unsplash.com/photo-1596783049539-77eb9e2d53bf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "des-103",
    name: "Designer Anarkali & Flared Kurti",
    modelNumber: "AC-STT-201",
    type: "stitching",
    pattern: "32-Kali High Flare Princess Cut",
    details: "Floor-length pure georgette Anarkali with canvas lining, umbrella flare, and hand-pleated yoke.",
    price: 2800,
    images: [
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "des-104",
    name: "Classic Katori & Princess Blouse",
    modelNumber: "AC-STT-202",
    type: "stitching",
    pattern: "Padded Designer Princess Cut with Back Bow",
    details: "Fine customized cotton-lining finish, seamless concealed zipper, padded cups with double interlock.",
    price: 1200,
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "des-105",
    name: "Mirror & Maggam Work Lehenga",
    modelNumber: "AC-EMB-105",
    type: "embroidery",
    pattern: "Traditional Temple Border Maggam Work",
    details: "Pure raw silk lehenga with intricate golden nakshi work and authentic glass mirrors for festive occasions.",
    price: 7500,
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "des-106",
    name: "Custom Indo-Western Peplum Top",
    modelNumber: "AC-OTH-301",
    type: "other",
    customType: "Indo-Western",
    pattern: "Asymmetric Hem Peplum with Organza Sleeves",
    details: "Pastel sage organza balloon sleeves, front closure with handcrafted potli buttons, tailored for skirts and dhotis.",
    price: 2200,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    ],
  },
];
