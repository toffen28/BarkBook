import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for the database
export type Profile = {
  id: string;
  email: string;
  business_name: string | null;
  phone: string | null;
  subscription_plan: 'solo' | 'salon';
  onboarding_completed: boolean;
  created_at: string;
};

export type Customer = {
  id: string;
  profile_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
};

export type Pet = {
  id: string;
  customer_id: string;
  name: string;
  breed: string | null;
  age: number | null;
  temperament: string | null;
  notes: string | null;
  created_at: string;
};

export type Job = {
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
};

export type Invoice = {
  id: string;
  job_id: string;
  total_amount: number;
  status: 'unpaid' | 'paid' | 'overdue';
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
};

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
