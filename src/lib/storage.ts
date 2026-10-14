import {
  Enquiry,
  FreightAgent,
  RateRequest,
  Quotation,
  AppSettings,
} from '@/types';
import {
  initialEnquiries,
  mockAgents,
  initialRateRequests,
  initialQuotations,
  initialSettings,
} from './mock-data';

const STORAGE_KEYS = {
  ENQUIRIES: 'apex_freight_enquiries_v1',
  AGENTS: 'apex_freight_agents_v1',
  RATE_REQUESTS: 'apex_freight_rate_requests_v1',
  QUOTATIONS: 'apex_freight_quotations_v1',
  SETTINGS: 'apex_freight_settings_v1',
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving to localStorage key "${key}":`, error);
  }
}

export const StorageService = {
  getEnquiries: (): Enquiry[] => getFromStorage(STORAGE_KEYS.ENQUIRIES, initialEnquiries),
  saveEnquiries: (data: Enquiry[]) => saveToStorage(STORAGE_KEYS.ENQUIRIES, data),

  getAgents: (): FreightAgent[] => getFromStorage(STORAGE_KEYS.AGENTS, mockAgents),
  saveAgents: (data: FreightAgent[]) => saveToStorage(STORAGE_KEYS.AGENTS, data),

  getRateRequests: (): RateRequest[] => getFromStorage(STORAGE_KEYS.RATE_REQUESTS, initialRateRequests),
  saveRateRequests: (data: RateRequest[]) => saveToStorage(STORAGE_KEYS.RATE_REQUESTS, data),

  getQuotations: (): Quotation[] => getFromStorage(STORAGE_KEYS.QUOTATIONS, initialQuotations),
  saveQuotations: (data: Quotation[]) => saveToStorage(STORAGE_KEYS.QUOTATIONS, data),

  getSettings: (): AppSettings => getFromStorage(STORAGE_KEYS.SETTINGS, initialSettings),
  saveSettings: (data: AppSettings) => saveToStorage(STORAGE_KEYS.SETTINGS, data),

  resetAllData: () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEYS.ENQUIRIES);
      window.localStorage.removeItem(STORAGE_KEYS.AGENTS);
      window.localStorage.removeItem(STORAGE_KEYS.RATE_REQUESTS);
      window.localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
      window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      // Re-initialize with initial data
      window.localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(initialEnquiries));
      window.localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(mockAgents));
      window.localStorage.setItem(STORAGE_KEYS.RATE_REQUESTS, JSON.stringify(initialRateRequests));
      window.localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(initialQuotations));
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    } catch (e) {
      console.error('Error resetting demo storage:', e);
    }
  },
};
