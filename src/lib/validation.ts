import { VerificationChecklist } from '@/types';

export interface EnquiryFormValues {
  customerName: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  serviceType: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  packageCount: string | number;
  weightKg: string | number;
  volumeCbm: string | number;
  readyDate: string;
  deliveryDate: string;
  notes?: string;
  assignedEmployee?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validateEnquiryForm(values: EnquiryFormValues): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!values.customerName?.trim()) {
    errors.customerName = 'Customer name is required';
  }

  if (!values.companyName?.trim()) {
    errors.companyName = 'Company name is required';
  }

  if (!values.contactPerson?.trim()) {
    errors.contactPerson = 'Contact person is required';
  }

  if (!values.email?.trim()) {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email format (e.g. name@company.com)';
  }

  if (!values.phone?.trim()) {
    errors.phone = 'Phone number is required';
  }

  if (!values.serviceType?.trim()) {
    errors.serviceType = 'Service type must be selected';
  }

  if (!values.origin?.trim()) {
    errors.origin = 'Origin port/city is required';
  }

  if (!values.destination?.trim()) {
    errors.destination = 'Destination port/city is required';
  }

  if (!values.cargoDescription?.trim()) {
    errors.cargoDescription = 'Cargo description is required';
  }

  const pkgCount = Number(values.packageCount);
  if (values.packageCount === '' || isNaN(pkgCount) || pkgCount <= 0) {
    errors.packageCount = 'Package quantity must be a positive number';
  }

  const weight = Number(values.weightKg);
  if (values.weightKg === '' || isNaN(weight) || weight <= 0) {
    errors.weightKg = 'Weight must be greater than 0 kg';
  }

  const volume = Number(values.volumeCbm);
  if (values.volumeCbm === '' || isNaN(volume) || volume <= 0) {
    errors.volumeCbm = 'Volume must be greater than 0 cbm';
  }

  if (!values.readyDate) {
    errors.readyDate = 'Shipment ready date is required';
  }

  if (!values.deliveryDate) {
    errors.deliveryDate = 'Required delivery date is required';
  } else if (values.readyDate && new Date(values.deliveryDate) < new Date(values.readyDate)) {
    errors.deliveryDate = 'Delivery date cannot be before shipment ready date';
  }

  return errors;
}

/**
 * Checks if the verification checklist allows moving to "Ready for Rate Request"
 * Must have no 'missing' or 'clarification' items.
 */
export function isVerificationReadyForRates(verification: VerificationChecklist): {
  isReady: boolean;
  missingItems: string[];
  clarificationItems: string[];
} {
  const missingItems: string[] = [];
  const clarificationItems: string[] = [];

  const checks: Record<string, string> = {
    contactDetails: 'Customer Contact Details',
    serviceType: 'Service Type Selection',
    originDestination: 'Origin & Destination Ports/Locations',
    cargoDescription: 'Detailed Cargo Description',
    packageQuantity: 'Package Quantity Verification',
    weightVolume: 'Weight & Volume Dimensions',
    readyDate: 'Shipment Ready Date',
    deliveryRequirements: 'Delivery Timeline & Special Requirements',
  };

  for (const [key, label] of Object.entries(checks)) {
    const state = verification[key as keyof VerificationChecklist];
    if (state === 'missing') {
      missingItems.push(label);
    } else if (state === 'clarification') {
      clarificationItems.push(label);
    }
  }

  const isReady = missingItems.length === 0 && clarificationItems.length === 0;

  return {
    isReady,
    missingItems,
    clarificationItems,
  };
}
