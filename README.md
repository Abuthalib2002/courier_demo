# Enquiry and Quotation Automation System — Logistics & Freight UI Demo

A modern, responsive enterprise SaaS application designed for freight forwarding, logistics, and courier operations. It simulates the complete business process from initial customer enquiry to quote acceptance.

## 🚀 Live Workflow

$$\text{Customer Enquiry} \longrightarrow \text{Acknowledgement} \longrightarrow \text{Information Verification} \longrightarrow \text{Carrier Rate RFP} \longrightarrow \text{Rate Received} \longrightarrow \text{Quotation Preparation} \longrightarrow \text{Sent to Customer} \longrightarrow \text{Accepted / Rejected}$$

---

## ✨ Key Features

- **Executive KPI Dashboard**: Live metrics for Total Enquiries, Pending Verification, Awaiting Agent Rates, and Quotes Prepared with pipeline distribution charts.
- **Enquiry Management**: Filterable and searchable shipment directory across Air Freight, Ocean Freight, Road Freight, and Express Courier with an interactive Quick View Drawer.
- **8-Point Quality Verification**: Pre-RFP checklist guarding against missing shipment details with automated customer clarification email drafting.
- **Carrier Rate RFP Management**: Partner agent registry and formal spot rate request simulation.
- **Real-Time Pricing Engine**: Itemized cost breakdown (Base freight, bunker fuel surcharge, terminal handling, customs/doc charges) with dynamic selling markup and VAT arithmetic.
- **Formal Quotation Generator**: Professional letterhead proposals with itemized charge schedules, validity periods, terms & conditions, and browser **Print / Save as PDF** support.
- **Interactive Workflow Monitor**: 11-stage visual stepper pipeline with intelligent progression gates.
- **Browser State Persistence**: 100% frontend state preserved in `localStorage` across refreshes with a factory reset option in Settings.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Persistence**: Browser `localStorage`

---

## 📦 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Abuthalib0206/courier_demo.git
cd courier_demo
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Production Build

```bash
npm run build
npm run start
```

---

## ☁️ Deployment

This project is optimized for 1-click deployment on **Vercel**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAbuthalib0206%2Fcourier_demo)

Or import the repository directly into [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
