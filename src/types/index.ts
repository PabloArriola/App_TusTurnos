export interface Specialist {
  id: string;
  name: string;
  role: string;
  registrationNumber?: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  patientCount: string;
  status: 'consultorio' | 'disponible' | 'en_turno';
  bio?: string;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  price: number;
  depositPercentage: number; // e.g. 30%
  description: string;
  popular?: boolean;
  tag?: string;
  iconName?: string;
  isCombo?: boolean;
  originalPrice?: number;
  comboItems?: string[];
  isActive?: boolean;
}

export interface BlockedSlot {
  id: string;
  date: string;
  time?: string;
  reason: string;
  allDay?: boolean;
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  headerSubtitle?: string;
  address: string;
  city: string;
  phoneWhatsapp: string;
  instagram: string;
  logo: string;
  aliasCbu: string;
  bankName: string;
  defaultDepositPercentage: number;
  specialists: Specialist[];
  services: Service[];
  availableDays: number[]; // 0 Sunday, 1 Monday, etc.
  openingTime?: string;
  closingTime?: string;
  bufferMinutes?: number;
  cancellationNoticeHours?: number;
  blockedSlots?: BlockedSlot[];
}

export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  serviceTitle: string;
  servicesList?: { id: string; title: string; price: number; durationMinutes: number }[];
  specialistId: string;
  specialistName: string;
  specialistAvatar: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  totalPrice: number;
  depositPaid: number;
  remainingBalance: number;
  status: 'confirmado' | 'pendiente_seña' | 'en_cabina' | 'completado' | 'cancelado';
  paymentMethod: 'mercadopago' | 'card' | 'transfer';
  paymentStatus: 'pagado' | 'pendiente_verificacion';
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientNotes?: string;
  createdAt: string;
}

export interface SavedCard {
  id: string;
  cardNumber: string; // e.g. "4532 •••• •••• 4092"
  last4: string; // "4092"
  cardholderName: string;
  expiryDate: string; // "12/28"
  brand: 'visa' | 'mastercard' | 'amex' | 'cabal';
  type: 'debito' | 'credito';
  isDefault: boolean;
}

export interface BillingInfo {
  invoiceType: 'B' | 'A';
  cuitCuil?: string;
  businessName?: string;
  taxCondition?: string;
}

export interface PaymentTransaction {
  id: string; // e.g. "TXN-98421"
  appointmentId?: string;
  concept: string;
  serviceTitle: string;
  amount: number;
  totalServicePrice?: number;
  remainingBalance?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: string;
  cardLast4?: string;
  status: 'aprobado' | 'reembolsado' | 'pendiente';
  mpOperationNumber: string;
  businessName: string;
  businessAddress: string;
  businessCuit?: string;
  clientName: string;
  clientEmail: string;
  clientDni?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  isVip: boolean;
  medicalSheetCompleted: number; // percentage e.g. 80
  loyaltyPoints: number;
  loyaltyCashBalance: number;
  allergies: string[];
  skinType: string;
  sensitivities: string[];
  consentSigned: boolean;
  savedCards?: SavedCard[];
  billingInfo?: BillingInfo;
}

export interface BookedServiceItem {
  id: string;
  service: Service;
  specialist: Specialist;
  date: string;
  formattedDate: string;
  time: string;
  endTime: string;
}
