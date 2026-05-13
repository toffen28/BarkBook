// Type definitions for BarkBook

export interface Profile {
  id: string;
  email: string;
  business_name: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  profile_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface Pet {
  id: string;
  customer_id: string;
  name: string;
  breed: string | null;
  age: number | null;
  temperament: string | null;
  notes: string | null;
  created_at: string;
  // Joined data
  customer_name?: string;
}

export interface Job {
  id: string;
  profile_id: string;
  customer_id: string;
  pet_id: string | null;
  date: string;
  time: string;
  service: string;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  // Joined data
  customer_name?: string;
  pet_name?: string;
}

export interface Invoice {
  id: string;
  job_id: string;
  total_amount: number;
  status: 'unpaid' | 'paid' | 'overdue';
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  // Joined data
  job?: Job;
  customer_name?: string;
  pet_name?: string;
}

export interface QuoteLineItem {
  description: string;
  price: number;
}

export interface Quote {
  id: string;
  profile_id: string;
  customer_id: string;
  pet_id: string | null;
  line_items: QuoteLineItem[];
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  notes: string | null;
  created_at: string;
  // Joined data
  customer_name?: string;
  pet_name?: string;
}

// Dashboard stats
export interface DashboardStats {
  todayJobs: number;
  weekRevenue: number;
  monthRevenue: number;
  outstandingInvoices: number;
  outstandingAmount: number;
}

// Form types
export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface PetFormData {
  name: string;
  breed: string;
  age: string;
  temperament: string;
  notes: string;
}

export interface JobFormData {
  customer_id: string;
  pet_id: string;
  date: string;
  time: string;
  service: string;
  price: string;
  notes: string;
}

// Service options for dog grooming
export const SERVICE_OPTIONS = [
  'Full Groom',
  'Bath & Brush',
  'Nail Trim',
  'Ear Cleaning',
  'Teeth Cleaning',
  'Deshedding',
  'Puppy Groom',
  'Senior Groom',
  'Mat Removal',
  'Other'
] as const;

export type ServiceType = typeof SERVICE_OPTIONS[number];
