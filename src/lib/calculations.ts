import { QuotationCostSummary } from '@/types';

export interface RateCalculationInput {
  baseFreightRate: number;
  fuelSurcharge: number;
  handlingCharge: number;
  customsDocCharge: number;
  otherCharges: number;
}

export interface PriceCalculationInput extends RateCalculationInput {
  markupPercent: number;
  taxPercent: number;
}

export interface CalculationResult {
  costs: QuotationCostSummary;
  sellingPrice: number;
  taxAmount: number;
  finalTotal: number;
}

/**
 * Calculates total cost from itemized rate charges
 */
export function calculateTotalCost(input: RateCalculationInput): number {
  const base = Number(input.baseFreightRate) || 0;
  const fuel = Number(input.fuelSurcharge) || 0;
  const handling = Number(input.handlingCharge) || 0;
  const customs = Number(input.customsDocCharge) || 0;
  const other = Number(input.otherCharges) || 0;

  return Math.round((base + fuel + handling + customs + other) * 100) / 100;
}

/**
 * Calculates selling price before tax from total cost and markup percentage
 * Formula: Selling Price = Total Cost * (1 + Markup Percentage / 100)
 */
export function calculateSellingPrice(totalCost: number, markupPercent: number): number {
  const cost = Number(totalCost) || 0;
  const markup = Number(markupPercent) || 0;
  const selling = cost * (1 + markup / 100);
  return Math.round(selling * 100) / 100;
}

/**
 * Calculates tax amount from selling price and tax percentage
 * Formula: Tax Amount = Selling Price * Tax Percentage / 100
 */
export function calculateTaxAmount(sellingPrice: number, taxPercent: number): number {
  const selling = Number(sellingPrice) || 0;
  const taxRate = Number(taxPercent) || 0;
  const tax = (selling * taxRate) / 100;
  return Math.round(tax * 100) / 100;
}

/**
 * Calculates final quotation total
 * Formula: Final Quotation Total = Selling Price + Tax Amount
 */
export function calculateFinalTotal(sellingPrice: number, taxAmount: number): number {
  const selling = Number(sellingPrice) || 0;
  const tax = Number(taxAmount) || 0;
  return Math.round((selling + tax) * 100) / 100;
}

/**
 * Full calculation pipeline
 */
export function calculateQuotationAmounts(input: PriceCalculationInput): CalculationResult {
  const totalCost = calculateTotalCost(input);
  const sellingPrice = calculateSellingPrice(totalCost, input.markupPercent);
  const taxAmount = calculateTaxAmount(sellingPrice, input.taxPercent);
  const finalTotal = calculateFinalTotal(sellingPrice, taxAmount);

  return {
    costs: {
      baseFreightRate: Number(input.baseFreightRate) || 0,
      fuelSurcharge: Number(input.fuelSurcharge) || 0,
      handlingCharge: Number(input.handlingCharge) || 0,
      customsDocCharge: Number(input.customsDocCharge) || 0,
      otherCharges: Number(input.otherCharges) || 0,
      totalCost,
    },
    sellingPrice,
    taxAmount,
    finalTotal,
  };
}

/**
 * Format currency consistently
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const validAmount = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(validAmount);
}

/**
 * Format number with comma separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num || 0);
}

/**
 * Add days to an ISO date string
 */
export function addDaysToDate(dateString: string, days: number): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    const today = new Date();
    today.setDate(today.getDate() + days);
    return today.toISOString().split('T')[0];
  }
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
