"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calculator,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Calendar,
  Clock,
  Building,
  FileSpreadsheet,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useAutomation } from '@/context/AutomationContext';
import {
  calculateQuotationAmounts,
  formatCurrency,
  addDaysToDate,
} from '@/lib/calculations';
import { RateBreakdown } from '@/types';
import { ServiceTypeBadge, RateRequestStatusBadge } from '@/components/ui/Badge';

function RateEntryAndCalculationContent() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.id as string;

  const {
    rateRequests,
    enquiries,
    settings,
    recordAgentRate,
    createQuotationFromRate,
    isLoaded,
  } = useAutomation();

  const currentRequest = rateRequests.find((r) => r.id === requestId);
  const linkedEnquiry = currentRequest
    ? enquiries.find((e) => e.id === currentRequest.enquiryId)
    : null;

  // Form State for Rate Breakdown
  const rb = currentRequest?.rateBreakdown;
  const [baseRate, setBaseRate] = useState<string>(() => rb ? String(rb.baseFreightRate) : '2400');
  const [fuelSurcharge, setFuelSurcharge] = useState<string>(() => rb ? String(rb.fuelSurcharge) : '350');
  const [handlingCharge, setHandlingCharge] = useState<string>(() => rb ? String(rb.handlingCharge) : '180');
  const [customsCharge, setCustomsCharge] = useState<string>(() => rb ? String(rb.customsDocCharge) : '120');
  const [otherCharges, setOtherCharges] = useState<string>(() => rb ? String(rb.otherCharges) : '50');
  const [currency, setCurrency] = useState<string>(() => rb?.currency || settings?.defaultCurrency || 'USD');
  const [transitTime, setTransitTime] = useState<string>(() => rb?.transitTime || '4-6 Business Days');
  const [validUntil, setValidUntil] = useState<string>(() => rb?.validUntil || addDaysToDate(new Date().toISOString(), 14));
  const [agentTerms, setAgentTerms] = useState<string>(() => rb?.termsAndConditions || 'Subject to standard space allocation and bunker surcharges at time of cargo delivery.');

  const [markupPercent, setMarkupPercent] = useState<number>(() => settings?.defaultMarkupPercent ?? 18);
  const [taxPercent, setTaxPercent] = useState<number>(() => settings?.defaultTaxPercent ?? 5);

  // Live Dynamic Calculations
  const calculations = useMemo(() => {
    return calculateQuotationAmounts({
      baseFreightRate: Number(baseRate) || 0,
      fuelSurcharge: Number(fuelSurcharge) || 0,
      handlingCharge: Number(handlingCharge) || 0,
      customsDocCharge: Number(customsCharge) || 0,
      otherCharges: Number(otherCharges) || 0,
      markupPercent: Number(markupPercent) || 0,
      taxPercent: Number(taxPercent) || 0,
    });
  }, [baseRate, fuelSurcharge, handlingCharge, customsCharge, otherCharges, markupPercent, taxPercent]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Rate Request Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">ID &quot;{requestId}&quot; does not exist.</p>
        <Link
          href="/rate-requests"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Rate Requests
        </Link>
      </div>
    );
  }

  const handleFillDemoValues = () => {
    setBaseRate('2850');
    setFuelSurcharge('420');
    setHandlingCharge('210');
    setCustomsCharge('150');
    setOtherCharges('75');
    setTransitTime('3-5 Business Days Direct Routing');
    setAgentTerms('Valid for 14 calendar days. Excludes demurrage/detention and local destination customs VAT.');
  };

  const handleSaveRateOnly = () => {
    const breakdown: RateBreakdown = {
      baseFreightRate: Number(baseRate) || 0,
      fuelSurcharge: Number(fuelSurcharge) || 0,
      handlingCharge: Number(handlingCharge) || 0,
      customsDocCharge: Number(customsCharge) || 0,
      otherCharges: Number(otherCharges) || 0,
      currency,
      transitTime,
      validUntil,
      termsAndConditions: agentTerms,
      receivedDate: new Date().toISOString(),
    };

    recordAgentRate(currentRequest.id, breakdown);
    router.push('/rate-requests');
  };

  const handleSaveAndGenerateQuotation = () => {
    const breakdown: RateBreakdown = {
      baseFreightRate: Number(baseRate) || 0,
      fuelSurcharge: Number(fuelSurcharge) || 0,
      handlingCharge: Number(handlingCharge) || 0,
      customsDocCharge: Number(customsCharge) || 0,
      otherCharges: Number(otherCharges) || 0,
      currency,
      transitTime,
      validUntil,
      termsAndConditions: agentTerms,
      receivedDate: new Date().toISOString(),
    };

    recordAgentRate(currentRequest.id, breakdown);

    // Create quote directly
    const newQuote = createQuotationFromRate(
      currentRequest.enquiryId,
      currentRequest.id,
      markupPercent,
      taxPercent
    );

    if (newQuote) {
      router.push(`/quotations/${newQuote.id}`);
    } else {
      router.push('/quotations');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/rate-requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Rate Requests
        </Link>

        <button
          onClick={handleFillDemoValues}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold border border-blue-200 transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Competitive Carrier Rate
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-extrabold text-blue-600">{currentRequest.id}</span>
              <RateRequestStatusBadge status={currentRequest.status} />
              <ServiceTypeBadge service={currentRequest.serviceType} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Carrier Rate Entry &amp; Margin Calculator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Carrier: <span className="font-semibold text-slate-800">{currentRequest.agentCompany}</span> ({currentRequest.agentName}) • Linked Enquiry:{' '}
              <span className="font-semibold text-slate-800">{currentRequest.enquiryId}</span>
            </p>
          </div>

          <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Consignment Route</span>
            <p className="text-xs font-bold text-slate-800">
              {currentRequest.origin.split(',')[0]} → {currentRequest.destination.split(',')[0]}
            </p>
            {linkedEnquiry && (
              <p className="text-[11px] text-slate-500">
                {linkedEnquiry.packageCount} pkgs • {linkedEnquiry.weightKg} kg • {linkedEnquiry.volumeCbm} CBM
              </p>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 7 COLS: Carrier Charges Breakdown Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                1. Itemized Carrier Cost Breakdown
              </h3>

              <div className="space-y-3.5">
                {/* Currency Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full p-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                    >
                      <option value="USD">USD ($) — US Dollars</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="GBP">GBP (£) — British Pounds</option>
                      <option value="AED">AED (د.إ) — UAE Dirhams</option>
                      <option value="SGD">SGD (S$) — Singapore Dollars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estimated Transit Time *
                    </label>
                    <input
                      type="text"
                      value={transitTime}
                      onChange={(e) => setTransitTime(e.target.value)}
                      placeholder="e.g. 3-5 Business Days"
                      className="w-full p-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Base Freight Rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Freight Tariff ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                {/* Fuel Surcharge */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fuel Surcharge / BAF ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={fuelSurcharge}
                    onChange={(e) => setFuelSurcharge(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                {/* Handling Charge */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Terminal / Handling Charge (THC) ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={handlingCharge}
                    onChange={(e) => setHandlingCharge(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                {/* Customs & Doc Charge */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customs Clearance &amp; Documentation Charge ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={customsCharge}
                    onChange={(e) => setCustomsCharge(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                {/* Other Charges */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Other Surcharges (Security, Port Fees, Monitoring) ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                {/* Rate Validity Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rate Validity Expiry Date
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full p-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Agent Terms */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Carrier Terms &amp; Conditions
                  </label>
                  <textarea
                    rows={2}
                    value={agentTerms}
                    onChange={(e) => setAgentTerms(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: Live Mathematical Calculation Engine */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm tracking-tight">Live Pricing Engine</span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Dynamic
                </span>
              </div>

              {/* Automatic Total Cost Box */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Total Carrier Cost (Sum of all charges)
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                  {formatCurrency(calculations.costs.totalCost, currency)}
                </p>
                <div className="mt-2 text-[11px] text-slate-400 space-y-0.5 font-mono">
                  <div>Base: {formatCurrency(calculations.costs.baseFreightRate, currency)}</div>
                  <div>Surcharges: {formatCurrency(calculations.costs.totalCost - calculations.costs.baseFreightRate, currency)}</div>
                </div>
              </div>

              {/* Selling Markup Inputs */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      Selling Markup Margin (%)
                    </span>
                    <span className="font-bold text-blue-400 text-sm">{markupPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>0% (At Cost)</span>
                    <span>15%</span>
                    <span>30%</span>
                    <span>60%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-blue-400" />
                      Optional VAT / Sales Tax Rate (%)
                    </span>
                    <span className="font-bold text-slate-300">{taxPercent}%</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Pricing Breakdown Results */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Selling Price Before Tax:</span>
                  <span className="font-bold text-white text-sm">
                    {formatCurrency(calculations.sellingPrice, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Tax Amount ({taxPercent}%):</span>
                  <span>{formatCurrency(calculations.taxAmount, currency)}</span>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Final Quotation Total:</span>
                  <span className="font-extrabold text-xl text-blue-400">
                    {formatCurrency(calculations.finalTotal, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAndGenerateQuotation}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Save Rate &amp; Prepare Customer Quotation →
                </button>

                <button
                  type="button"
                  onClick={handleSaveRateOnly}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Save Carrier Rate Only (Stay on RFP)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RateEntryAndCalculationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RateEntryAndCalculationContent />
    </React.Suspense>
  );
}
