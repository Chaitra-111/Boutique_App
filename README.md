# Aruna Creations - Boutique Management & Customer Catalog Web App

A modern, mobile-first web application designed specifically for **Aruna Creations** boutique studio.

## ✨ Features
- **Mobile-First UX & Light Pastel Theme**: Soft blush, warm ivory, sage mint, and muted rose gold tones.
- **Boutique Owner Dashboard (`/`)**:
  - **Orders Management**: Customer details, measurements, design model, base cost, extra delivery/custom charges, and auto-calculated balances.
  - **Notify Ready**: 1-tap WhatsApp alert sending completed order details to the customer.
  - **Add Order & Design**: Dropdown catalog selection, measurement sheets, and auto-draft saving.
  - **Designs Catalog**: 2-column mobile cards, category filtering (Embroidery, Stitching, Other), multi-image uploader, and WhatsApp design sharing.
  - **Customer Section**: Direct Call and WhatsApp buttons for every client with live search and order history.
- **Customer Portal (`/c`)**:
  - Isolated client browsing without access to the admin dashboard.
  - Catalog browsing with **strictly hidden internal pricing**.
  - Direct **"Interested"**, **"WhatsApp Boutique"**, and **"Call Boutique"** actions.
- **Backend & Database**:
  - Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **MongoDB (Mongoose)**.

## 🚀 Getting Started

1. **Install Dependencies**:
```bash
npm install
```

2. **Run MongoDB**:
Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017/aruna_creations`.

3. **Start Development Server**:
```bash
npm run dev -- -p 3005
```

4. **Access the Application**:
- **Boutique Owner Dashboard**: `http://localhost:3005`
- **Customer Catalog**: `http://localhost:3005/c`
