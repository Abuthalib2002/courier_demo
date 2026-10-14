"use client";

import React, { useState } from 'react';
import {
  Building,
  DollarSign,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import { AppSettings } from '@/types';
import Modal from '@/components/ui/Modal';

function SettingsForm({
  initialSettings,
  onSave,
}: {
  initialSettings: AppSettings;
  onSave: (values: AppSettings) => void;
}) {
  const [formValues, setFormValues] = useState<AppSettings>(initialSettings);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]:
        name === 'defaultMarkupPercent' ||
        name === 'defaultTaxPercent' ||
        name === 'quotationValidityDays'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Company Identity */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Company Profile &amp; Letterhead
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formValues.companyName}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tax Registration / VAT TRN</label>
            <input
              type="text"
              name="taxRegistrationNumber"
              value={formValues.taxRegistrationNumber}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Registered Business Address</label>
            <input
              type="text"
              name="companyAddress"
              value={formValues.companyAddress}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Contact Email</label>
            <input
              type="email"
              name="companyEmail"
              value={formValues.companyEmail}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Telephone Number</label>
            <input
              type="text"
              name="companyPhone"
              value={formValues.companyPhone}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing Defaults */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Default Pricing &amp; Commercial Margins
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Default Base Currency</label>
            <select
              name="defaultCurrency"
              value={formValues.defaultCurrency}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold"
            >
              <option value="USD">USD ($) — United States Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="AED">AED (د.إ) — UAE Dirham</option>
              <option value="SGD">SGD (S$) — Singapore Dollar</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Default Forwarding Markup (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              name="defaultMarkupPercent"
              value={formValues.defaultMarkupPercent}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Default Sales Tax / VAT (%)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              step="0.5"
              name="defaultTaxPercent"
              value={formValues.defaultTaxPercent}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Quotation Validity Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              name="quotationValidityDays"
              value={formValues.quotationValidityDays}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Default Terms & Conditions */}
      <div className="p-6 border-b border-slate-100 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            3. Default Freight Terms &amp; Conditions
          </h3>
        </div>

        <textarea
          rows={5}
          name="defaultTerms"
          value={formValues.defaultTerms}
          onChange={handleChange}
          className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700 leading-relaxed"
        />
      </div>

      {/* Save Bar */}
      <div className="p-6 bg-slate-50/80 flex items-center justify-between">
        <p className="text-xs text-slate-400">Settings automatically persist in browser local storage.</p>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs shadow-blue-500/25 transition flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Save Configuration
        </button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, resetDemoData, isLoaded } = useAutomation();
  const [showResetModal, setShowResetModal] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System &amp; Pricing Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure default forwarding markup parameters, company details, and quotation terms.
        </p>
      </div>

      <SettingsForm
        key={`${settings.companyName}-${settings.defaultCurrency}-${settings.defaultMarkupPercent}-${settings.defaultTaxPercent}-${settings.quotationValidityDays}`}
        initialSettings={settings}
        onSave={updateSettings}
      />

      {/* DANGER / DEMO DATA RESET CARD */}
      <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            Reset Demo Data to Initial State
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Clears all your browser changes and re-seeds the demo with the 10+ realistic shipping enquiries, 5 mock freight agents, and quotations across all stages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Demo Data
        </button>
      </div>

      {/* Confirmation Modal */}
      {showResetModal && (
        <Modal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          title="Confirm Resetting Demo Data"
          subtitle="All created enquiries and modified rates will be re-initialized"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Yes, Reset All Demo Data
              </button>
            </div>
          }
        >
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to restore the initial demo state? This will reload the 12 sample enquiries, carrier tariffs, and quotations.
          </p>
        </Modal>
      )}
    </div>
  );
}
