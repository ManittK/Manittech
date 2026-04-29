import { Timestamp } from 'firebase/firestore';

export type UserRole = 'customer' | 'worker' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  referralCode?: string;
  referredBy?: string;
  credits?: number;
  isWorkerActive?: boolean;
  commissionLock?: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface WorkerProfile {
  uid: string;
  skill: string;
  description: string;
  rate: number;
  experience: number;
  location: string;
  rating: number;
  reviewCount: number;
  availability: string;
  status: 'active' | 'inactive';
  verifiedUntil?: Timestamp;
  upiId?: string;
  phone?: string;
  address?: string;
  qrCodeUrl?: string;
}

export interface PlatformSettings {
  adminUpiId: string;
  commissionPercentage: number;
  adminEmails: string[];
  lastBillRun?: Timestamp;
  qrLogoUrl?: string;
}

export interface Booking {
  id?: string;
  customerId: string;
  workerId: string;
  serviceType: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  paymentStatus: 'unpaid' | 'paid';
  transactionId?: string;
  bookingTime: Timestamp;
  createdAt: Timestamp;
  serviceDetails?: string;
  visitTime?: Timestamp;
}

export interface Transaction {
  id?: string;
  bookingId: string;
  amount: number;
  workerId: string;
  customerId: string;
  paymentMethod: string;
  status: 'success' | 'pending' | 'failed';
  createdAt: Timestamp;
}

export interface CommissionBill {
  id?: string;
  workerId: string;
  month: string;
  totalRevenue: number;
  commissionAmount: number;
  status: 'unpaid' | 'pending_verification' | 'paid';
  transactionId?: string;
  dueDate: Timestamp;
  createdAt: Timestamp;
}

export interface Referral {
  id?: string;
  referrerId: string;
  referredId: string;
  rewardAmount: number;
  createdAt: Timestamp;
}

export interface ToolUsage {
  userId: string;
  toolName: string;
  createdAt: Timestamp;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    // providerInfo is optional
  }
}
