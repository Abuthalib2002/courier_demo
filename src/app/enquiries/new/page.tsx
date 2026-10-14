"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Ship,
  Plane,
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import { validateEnquiryForm, EnquiryFormValues, ValidationErrors } from '@/lib/validation';
import { ServiceType } from '@/types';

export default function CreateEnquiryPage() {
  const router = useRouter();
  const { addEnquiry } = useAutomation();

  const [formValues, setFormValues] = useState<EnquiryFormValues>(() => ({
    customerName: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    serviceType: 'Air Freight',
    origin: '',
    destination: '',
    cargoDescription: '',
    packageCount: '',
    weightKg: '',
    volumeCbm: '',
    readyDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    notes: '',
    assignedEmployee: 'Sarah Jenkins',
  }));

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFillSample = () => {
    setFormValues({
      customerName: 'Klaus Mueller',
      companyName: 'Bavarian Precision Optics AG',
      contactPerson: 'Klaus Mueller (Head of Global Logistics)',
      email: 'k.mueller@bavarian-optics.de',
      phone: '+49 89 7720 1930',
      serviceType: 'Air Freight',
      origin: 'Munich Franz Josef Strauss Airport (MUC), Germany',
      destination: 'Tokyo Haneda International (HND), Japan',
      cargoDescription: '6 Wooden Crates of High-Precision Optical Lenses and Interferometer Prism Assemblies (Shock & Fragile)',
      packageCount: 6,
      weightKg: 420,
      volumeCbm: 2.4,
      readyDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0],
      notes: 'Fragile precision cargo. Requires temperature monitoring between +15°C and +25°C. No double-stacking.',
      assignedEmployee: 'Sarah Jenkins',
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateEnquiryForm(formValues);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const created = addEnquiry({
        customerName: formValues.customerName,
        companyName: formValues.companyName,
        contactPerson: formValues.contactPerson,
        email: formValues.email,
        phone: formValues.phone,
        serviceType: formValues.serviceType as ServiceType,
        origin: formValues.origin,
        destination: formValues.destination,
        cargoDescription: formValues.cargoDescription,
        packageCount: Number(formValues.packageCount),
        weightKg: Number(formValues.weightKg),
        volumeCbm: Number(formValues.volumeCbm),
        readyDate: formValues.readyDate,
        deliveryDate: formValues.deliveryDate,
        notes: formValues.notes,
        assignedEmployee: formValues.assignedEmployee || 'Sarah Jenkins',
      });

      // Navigate to the newly created enquiry's detail view
      router.push(`/enquiries/${created.id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const services: { type: ServiceType; label: string; icon: typeof Plane; desc: string }[] = [
    {
      type: 'Air Freight',
      label: 'Air Freight',
      icon: Plane,
      desc: 'Rapid international airport-to-airport transit for high-value cargo',
    },
    {
      type: 'Sea Freight',
      label: 'Sea Freight',
      icon: Ship,
      desc: 'FCL & LCL maritime container shipment for heavy or voluminous consignments',
    },
    {
      type: 'Road Freight',
      label: 'Road Freight',
      icon: Truck,
      desc: 'FTL / LTL cross-border road trucking and regional distribution',
    },
    {
      type: 'Courier',
      label: 'Express Courier',
      icon: Package,
      desc: 'Time-critical door-to-door courier parcels, documents, and samples',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Fast Demo Auto-fill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Enquiries List
        </Link>

        <button
          type="button"
          onClick={handleFillSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Realistic Demo Data
        </button>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Form Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Register Customer Enquiry</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture essential client and cargo parameters to start the automated qualification and pricing workflow.
          </p>

          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Please correct the missing or invalid fields:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 opacity-90">
                  {Object.values(errors).slice(0, 4).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {Object.values(errors).length > 4 && (
                    <li>...and {Object.values(errors).length - 4} more field(s)</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-8">
          {/* SECTION 1: Service Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Select Freight Service Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {services.map((item) => {
                const Icon = item.icon;
                const isSelected = formValues.serviceType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setFormValues((prev) => ({ ...prev, serviceType: item.type }))}
                    className={`p-3.5 text-left rounded-xl border transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="mt-3">
                      <p className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Customer Contact Information */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Customer & Company Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer / Shipper Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="customerName"
                    value={formValues.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Klaus Mueller"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                      errors.customerName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.customerName && <p className="text-[11px] text-rose-600 mt-1">{errors.customerName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="companyName"
                    value={formValues.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Bavarian Precision Optics AG"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                      errors.companyName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.companyName && <p className="text-[11px] text-rose-600 mt-1">{errors.companyName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Person & Title *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formValues.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Klaus Mueller (Global Logistics Manager)"
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.contactPerson ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.contactPerson && <p className="text-[11px] text-rose-600 mt-1">{errors.contactPerson}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    placeholder="k.mueller@bavarian-optics.de"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                      errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleChange}
                    placeholder="+49 89 7720 1930"
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                      errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Employee
                </label>
                <select
                  name="assignedEmployee"
                  value={formValues.assignedEmployee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Senior Freight Specialist)</option>
                  <option value="Michael Chang">Michael Chang (Ocean & Intermodal Officer)</option>
                  <option value="Robert Sterling">Robert Sterling (Air Freight Lead)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Shipment Routing & Specifications */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Shipment Routing & Cargo Specifications
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Origin (Port / Airport / City) *
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formValues.origin}
                  onChange={handleChange}
                  placeholder="e.g. Munich Airport (MUC), Germany"
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.origin ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.origin && <p className="text-[11px] text-rose-600 mt-1">{errors.origin}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination (Port / Airport / City) *
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formValues.destination}
                  onChange={handleChange}
                  placeholder="e.g. Tokyo Haneda (HND), Japan"
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.destination ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.destination && <p className="text-[11px] text-rose-600 mt-1">{errors.destination}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo Description & Nature of Goods *
              </label>
              <textarea
                name="cargoDescription"
                rows={2}
                value={formValues.cargoDescription}
                onChange={handleChange}
                placeholder="Describe commodity, packing type, pallet dimensions, hazardous status..."
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                  errors.cargoDescription ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.cargoDescription && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.cargoDescription}</p>
              )}
            </div>

            {/* Numeric Measurements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Number of Packages *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  name="packageCount"
                  value={formValues.packageCount}
                  onChange={handleChange}
                  placeholder="e.g. 6"
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.packageCount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.packageCount && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.packageCount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Gross Weight (kg) *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  name="weightKg"
                  value={formValues.weightKg}
                  onChange={handleChange}
                  placeholder="e.g. 420"
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.weightKg ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.weightKg && <p className="text-[11px] text-rose-600 mt-1">{errors.weightKg}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Volume (CBM / m³) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  name="volumeCbm"
                  value={formValues.volumeCbm}
                  onChange={handleChange}
                  placeholder="e.g. 2.4"
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.volumeCbm ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.volumeCbm && <p className="text-[11px] text-rose-600 mt-1">{errors.volumeCbm}</p>}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shipment Ready Date *
                </label>
                <input
                  type="date"
                  name="readyDate"
                  value={formValues.readyDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.readyDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.readyDate && <p className="text-[11px] text-rose-600 mt-1">{errors.readyDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Delivery Date *
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formValues.deliveryDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition ${
                    errors.deliveryDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.deliveryDate && <p className="text-[11px] text-rose-600 mt-1">{errors.deliveryDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Operational Instructions or Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formValues.notes}
                onChange={handleChange}
                placeholder="Special handling, customs permits, delivery time windows, temperature limits..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Form Footer Buttons */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          <Link
            href="/enquiries"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-blue-500/25 transition flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save & Register Enquiry
          </button>
        </div>
      </form>
    </div>
  );
}
