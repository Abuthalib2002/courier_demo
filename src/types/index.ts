export type ServiceType = 'Air Freight' | 'Sea Freight' | 'Road Freight' | 'Courier';

export type EnquiryStatus = 
  | 'New'
  | 'Awaiting Information'
  | 'Verified'
  | 'Rate Requested'
  | 'Rate Received'
  | 'Quoted'
  | 'Accepted'
  | 'Rejected';

export type VerificationState = 'complete' | 'missing' | 'clarification';

export interface VerificationChecklist {
  contactDetails: VerificationState;
  serviceType: VerificationState;
  originDestination: VerificationState;
  cargoDescription: VerificationState;
  packageQuantity: VerificationState;
  weightVolume: VerificationState;
  readyDate: VerificationState;
  deliveryRequirements: VerificationState;
  notes?: string;
  clarificationMessage?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  badge?: 'info' | 'success' | 'warning' | 'danger';
}

export interface Enquiry {
  id: string;
  customerName: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  serviceType: ServiceType;
  origin: string;
  destination: string;
  cargoDescription: string;
  packageCount: number;
  weightKg: number;
  volumeCbm: number;
  readyDate: string;
  deliveryDate: string;
  receivedDate: string;
  assignedEmployee: string;
  notes?: string;
  status: EnquiryStatus;
  acknowledgementSent: boolean;
  acknowledgementDate?: string;
  verification: VerificationChecklist;
  activityHistory: ActivityLog[];
}

export interface FreightAgent {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  services: ServiceType[];
  coverage: string;
  rating: number; // e.g. 4.8
  responseTimeHours: number;
}

export type RateRequestStatus = 
  | 'Draft'
  | 'Ready to Send'
  | 'Sent — Demo'
  | 'Rate Received'
  | 'Overdue';

export interface RateBreakdown {
  baseFreightRate: number;
  fuelSurcharge: number;
  handlingCharge: number;
  customsDocCharge: number;
  otherCharges: number;
  currency: string;
  transitTime: string;
  validUntil: string;
  termsAndConditions: string;
  receivedDate: string;
}

export interface RateRequest {
  id: string;
  enquiryId: string;
  agentId: string;
  agentName: string;
  agentCompany: string;
  agentEmail: string;
  serviceType: ServiceType;
  origin: string;
  destination: string;
  requestDate: string;
  expectedResponseDate: string;
  status: RateRequestStatus;
  sentDate?: string;
  rateBreakdown?: RateBreakdown;
  demoEmailPreview?: {
    subject: string;
    body: string;
  };
}

export type QuotationStatus = 
  | 'Draft'
  | 'Ready for Review'
  | 'Approved — Demo'
  | 'Sent — Demo'
  | 'Accepted'
  | 'Rejected'
  | 'Expired';

export interface QuotationCostSummary {
  baseFreightRate: number;
  fuelSurcharge: number;
  handlingCharge: number;
  customsDocCharge: number;
  otherCharges: number;
  totalCost: number;
}

export interface Quotation {
  id: string;
  enquiryId: string;
  rateRequestId?: string;
  customerName: string;
  companyName: string;
  contactPerson: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: ServiceType;
  origin: string;
  destination: string;
  cargoDescription: string;
  packageCount: number;
  weightKg: number;
  volumeCbm: number;
  currency: string;
  costs: QuotationCostSummary;
  markupPercent: number;
  sellingPrice: number;
  taxPercent: number;
  taxAmount: number;
  finalTotal: number;
  transitTime: string;
  validUntil: string;
  createdDate: string;
  status: QuotationStatus;
  termsAndConditions: string;
  approvedBy?: string;
  approvedDate?: string;
  sentDate?: string;
  customerDecisionDate?: string;
  customerDecisionNotes?: string;
  activityHistory: ActivityLog[];
}

export interface AppSettings {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string;
  taxRegistrationNumber: string;
  defaultCurrency: string;
  defaultMarkupPercent: number;
  defaultTaxPercent: number;
  quotationValidityDays: number;
  defaultTerms: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

export type WorkflowStageKey = 
  | 'enquiry_received'
  | 'acknowledgement_prepared'
  | 'information_verification'
  | 'customer_clarification'
  | 'ready_for_rate_request'
  | 'agent_rate_request'
  | 'agent_rate_received'
  | 'quotation_preparation'
  | 'quote_approval'
  | 'quote_sent'
  | 'customer_decision';

export interface WorkflowStageInfo {
  key: WorkflowStageKey;
  stepNumber: number;
  title: string;
  description: string;
}
