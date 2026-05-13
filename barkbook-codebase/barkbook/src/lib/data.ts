import { supabase } from './supabase';
import type { Customer, Pet, Job, Invoice, Quote, QuoteLineItem } from './types';

// Check if Supabase is configured
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = SUPABASE_URL.includes('supabase.co') && !SUPABASE_ANON_KEY.includes('your-anon');

// Persistence helpers for Demo Mode
const STORAGE_KEYS = {
  CUSTOMERS: 'barkbook_customers',
  PETS: 'barkbook_pets',
  JOBS: 'barkbook_jobs',
  INVOICES: 'barkbook_invoices',
  QUOTES: 'barkbook_quotes',
};

function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStoredData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Mock data storage (in-memory for demo mode)
const initialCustomers: Customer[] = [
  { id: '1', profile_id: 'demo', name: 'Sarah Johnson', phone: '07700 900123', email: 'sarah@example.com', address: '12 Oak Lane, Manchester', created_at: '2024-01-15' },
  { id: '2', profile_id: 'demo', name: 'Mike Peters', phone: '07700 900456', email: 'mike@example.com', address: '45 High Street, Manchester', created_at: '2024-02-20' },
  { id: '3', profile_id: 'demo', name: 'Emma Wilson', phone: '07700 900789', email: 'emma@example.com', address: '8 Pine Road, Manchester', created_at: '2024-03-10' },
];

const initialPets: Pet[] = [
  { id: '1', customer_id: '1', name: 'Buddy', breed: 'Golden Retriever', age: 3, temperament: 'Friendly', notes: 'Loves treats and belly rubs', created_at: '2024-01-15' },
  { id: '2', customer_id: '2', name: 'Luna', breed: 'Labrador', age: 5, temperament: 'Calm', notes: null, created_at: '2024-02-20' },
  { id: '3', customer_id: '3', name: 'Max', breed: 'French Bulldog', age: 2, temperament: 'Energetic', notes: 'Hates the dryer', created_at: '2024-03-10' },
];

const initialJobs: Job[] = [
  { id: '1', profile_id: 'demo', customer_id: '1', pet_id: '1', date: new Date().toISOString().split('T')[0], time: '09:00', service: 'Full Groom', price: 65, status: 'completed', notes: null, created_at: new Date().toISOString() },
  { id: '2', profile_id: 'demo', customer_id: '2', pet_id: '2', date: new Date().toISOString().split('T')[0], time: '11:30', service: 'Bath & Brush', price: 45, status: 'scheduled', notes: null, created_at: new Date().toISOString() },
  { id: '3', profile_id: 'demo', customer_id: '3', pet_id: '3', date: new Date().toISOString().split('T')[0], time: '14:00', service: 'Nail Trim', price: 20, status: 'scheduled', notes: null, created_at: new Date().toISOString() },
];

const initialInvoices: Invoice[] = [
  { id: 'inv-1', job_id: '1', total_amount: 65, status: 'unpaid', due_date: '2024-04-15', paid_at: null, created_at: new Date().toISOString() },
];

const initialQuotes: Quote[] = [
  {
    id: 'quote-1',
    profile_id: 'demo',
    customer_id: '1',
    pet_id: '1',
    line_items: [
      { description: 'Full Groom - Golden Retriever', price: 65 },
      { description: 'De-matting Treatment', price: 20 },
    ],
    total_amount: 85,
    status: 'sent',
    notes: 'Longer coat than usual, will need extra time.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'quote-2',
    profile_id: 'demo',
    customer_id: '2',
    pet_id: '2',
    line_items: [
      { description: 'Bath & Brush', price: 45 },
    ],
    total_amount: 45,
    status: 'draft',
    notes: null,
    created_at: new Date().toISOString(),
  },
];

// Helper to generate UUIDs for mock mode
function generateId(): string {
  return 'mock-' + Math.random().toString(36).substring(2, 15);
}

// Get the current user's profile ID
export async function getProfileId(): Promise<string | null> {
  if (!isSupabaseConfigured) {
    return 'demo';
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();
    
  return profile?.id || null;
}

// Customer CRUD operations
export async function getCustomers(profileId: string): Promise<Customer[]> {
  if (!isSupabaseConfigured) {
    const customers = getStoredData(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    return customers.filter(c => c.profile_id === profileId);
  }
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function getCustomer(id: string): Promise<Customer | null> {
  if (!isSupabaseConfigured) {
    const customers = getStoredData(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    return customers.find(c => c.id === id) || null;
  }
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
  if (!isSupabaseConfigured) {
    const customers = getStoredData(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    const updatedCustomers = [newCustomer, ...customers];
    setStoredData(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    return newCustomer;
  }
  
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  if (!isSupabaseConfigured) {
    const customers = getStoredData(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      const updatedCustomer = { ...customers[index], ...updates };
      const updatedCustomers = [...customers];
      updatedCustomers[index] = updatedCustomer;
      setStoredData(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
      return updatedCustomer;
    }
    throw new Error('Customer not found');
  }
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const customers = getStoredData(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    const pets = getStoredData(STORAGE_KEYS.PETS, initialPets);
    
    const updatedCustomers = customers.filter(c => c.id !== id);
    const updatedPets = pets.filter(p => p.customer_id !== id);
    
    setStoredData(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    setStoredData(STORAGE_KEYS.PETS, updatedPets);
    return;
  }
  
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// Pet CRUD operations
export async function getPets(customerId: string): Promise<Pet[]> {
  if (!isSupabaseConfigured) {
    const pets = getStoredData(STORAGE_KEYS.PETS, initialPets);
    return pets.filter(p => p.customer_id === customerId);
  }
  
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function getPet(id: string): Promise<Pet | null> {
  if (!isSupabaseConfigured) {
    const pets = getStoredData(STORAGE_KEYS.PETS, initialPets);
    return pets.find(p => p.id === id) || null;
  }
  
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createPet(pet: Omit<Pet, 'id' | 'created_at'>): Promise<Pet> {
  if (!isSupabaseConfigured) {
    const pets = getStoredData(STORAGE_KEYS.PETS, initialPets);
    const newPet: Pet = {
      ...pet,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    const updatedPets = [newPet, ...pets];
    setStoredData(STORAGE_KEYS.PETS, updatedPets);
    return newPet;
  }
  
  const { data, error } = await supabase
    .from('pets')
    .insert(pet)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updatePet(id: string, updates: Partial<Pet>): Promise<Pet> {
  if (!isSupabaseConfigured) {
    const pets = getStoredData(STORAGE_KEYS.PETS, initialPets);
    const index = pets.findIndex(p => p.id === id);
    if (index !== -1) {
      const updatedPet = { ...pets[index], ...updates };
      const updatedPets = [...pets];
      updatedPets[index] = updatedPet;
      setStoredData(STORAGE_KEYS.PETS, updatedPets);
      return updatedPet;
    }
    throw new Error('Pet not found');
  }
  
  const { data, error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deletePet(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const pets = getStoredData(STORAGE_KEYS.PETS, initialPets);
    const updatedPets = pets.filter(p => p.id !== id);
    setStoredData(STORAGE_KEYS.PETS, updatedPets);
    return;
  }
  
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// Get customers with their pets (for list view)
export async function getCustomersWithPets(profileId: string): Promise<(Customer & { pets: Pet[] })[]> {
  const customers = await getCustomers(profileId);
  
  const customersWithPets = await Promise.all(
    customers.map(async (customer) => {
      const pets = await getPets(customer.id);
      return { ...customer, pets };
    })
  );
  
  return customersWithPets;
}

// Job operations
export async function getJobsByCustomer(customerId: string): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, initialJobs);
    return jobs.filter(j => j.customer_id === customerId);
  }
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('customer_id', customerId)
    .order('date', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function getJobs(profileId: string): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, initialJobs);
    return jobs.filter(j => j.profile_id === profileId);
  }
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('profile_id', profileId)
    .order('date', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function getJob(id: string): Promise<Job | null> {
  if (!isSupabaseConfigured) {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, initialJobs);
    return jobs.find(j => j.id === id) || null;
  }
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createJob(job: Omit<Job, 'id' | 'created_at'>): Promise<Job> {
  if (!isSupabaseConfigured) {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, initialJobs);
    const newJob: Job = {
      ...job,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    const updatedJobs = [newJob, ...jobs];
    setStoredData(STORAGE_KEYS.JOBS, updatedJobs);
    return newJob;
  }
  
  const { data, error } = await supabase
    .from('jobs')
    .insert(job)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job> {
  if (!isSupabaseConfigured) {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, initialJobs);
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      const updatedJob = { ...jobs[index], ...updates };
      const updatedJobs = [...jobs];
      updatedJobs[index] = updatedJob;
      setStoredData(STORAGE_KEYS.JOBS, updatedJobs);
      return updatedJob;
    }
    throw new Error('Job not found');
  }
  
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteJob(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, initialJobs);
    const updatedJobs = jobs.filter(j => j.id !== id);
    setStoredData(STORAGE_KEYS.JOBS, updatedJobs);
    return;
  }
  
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// Get jobs for a specific date range
export async function getJobsForDateRange(profileId: string, startDate: string, endDate: string): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, initialJobs);
    return jobs.filter(j => 
      j.profile_id === profileId && 
      j.date >= startDate && 
      j.date <= endDate
    );
  }
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('profile_id', profileId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true });
    
  if (error) throw error;
  return data || [];
}

// Invoice operations
export async function getInvoices(profileId: string): Promise<Invoice[]> {
  if (!isSupabaseConfigured) {
    const jobs = getStoredData(STORAGE_KEYS.JOBS, initialJobs);
    const invoices = getStoredData(STORAGE_KEYS.INVOICES, initialInvoices);
    // Return all mock invoices that have jobs belonging to profileId
    const profileJobIds = jobs.filter(j => j.profile_id === profileId).map(j => j.id);
    return invoices.filter(i => profileJobIds.includes(i.job_id));
  }
  
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  if (!isSupabaseConfigured) {
    const invoices = getStoredData(STORAGE_KEYS.INVOICES, initialInvoices);
    return invoices.find(i => i.id === id) || null;
  }
  
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> {
  if (!isSupabaseConfigured) {
    const invoices = getStoredData(STORAGE_KEYS.INVOICES, initialInvoices);
    const newInvoice: Invoice = {
      ...invoice,
      id: 'inv-' + generateId(),
      created_at: new Date().toISOString(),
    };
    const updatedInvoices = [newInvoice, ...invoices];
    setStoredData(STORAGE_KEYS.INVOICES, updatedInvoices);
    return newInvoice;
  }
  
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  if (!isSupabaseConfigured) {
    const invoices = getStoredData(STORAGE_KEYS.INVOICES, initialInvoices);
    const index = invoices.findIndex(i => i.id === id);
    if (index !== -1) {
      const updatedInvoice = { ...invoices[index], ...updates };
      const updatedInvoices = [...invoices];
      updatedInvoices[index] = updatedInvoice;
      setStoredData(STORAGE_KEYS.INVOICES, updatedInvoices);
      return updatedInvoice;
    }
    throw new Error('Invoice not found');
  }
  
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteInvoice(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const invoices = getStoredData(STORAGE_KEYS.INVOICES, initialInvoices);
    const updatedInvoices = invoices.filter(i => i.id !== id);
    setStoredData(STORAGE_KEYS.INVOICES, updatedInvoices);
    return;
  }
  
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  return updateInvoice(id, {
    status: 'paid',
    paid_at: new Date().toISOString(),
  });
}

// Quote CRUD operations
export async function getQuotes(profileId: string): Promise<Quote[]> {
  if (!isSupabaseConfigured) {
    const quotes = getStoredData(STORAGE_KEYS.QUOTES, initialQuotes);
    return quotes.filter(q => q.profile_id === profileId);
  }

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    line_items: typeof row.line_items === 'string' ? JSON.parse(row.line_items) : row.line_items,
  })) as Quote[];
}

export async function getQuote(id: string): Promise<Quote | null> {
  if (!isSupabaseConfigured) {
    const quotes = getStoredData(STORAGE_KEYS.QUOTES, initialQuotes);
    return quotes.find(q => q.id === id) || null;
  }

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    line_items: typeof data.line_items === 'string' ? JSON.parse(data.line_items) : data.line_items,
  } as Quote;
}

export async function createQuote(quote: Omit<Quote, 'id' | 'created_at'>): Promise<Quote> {
  if (!isSupabaseConfigured) {
    const quotes = getStoredData(STORAGE_KEYS.QUOTES, initialQuotes);
    const newQuote: Quote = {
      ...quote,
      id: 'quote-' + generateId(),
      created_at: new Date().toISOString(),
    };
    const updatedQuotes = [newQuote, ...quotes];
    setStoredData(STORAGE_KEYS.QUOTES, updatedQuotes);
    return newQuote;
  }

  const { data, error } = await supabase
    .from('quotes')
    .insert({ ...quote, line_items: JSON.stringify(quote.line_items) })
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    line_items: typeof data.line_items === 'string' ? JSON.parse(data.line_items) : data.line_items,
  } as Quote;
}

export async function updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
  if (!isSupabaseConfigured) {
    const quotes = getStoredData(STORAGE_KEYS.QUOTES, initialQuotes);
    const index = quotes.findIndex(q => q.id === id);
    if (index !== -1) {
      const updatedQuote = { ...quotes[index], ...updates };
      const updatedQuotes = [...quotes];
      updatedQuotes[index] = updatedQuote;
      setStoredData(STORAGE_KEYS.QUOTES, updatedQuotes);
      return updatedQuote;
    }
    throw new Error('Quote not found');
  }

  const payload = updates.line_items
    ? { ...updates, line_items: JSON.stringify(updates.line_items) }
    : updates;

  const { data, error } = await supabase
    .from('quotes')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    line_items: typeof data.line_items === 'string' ? JSON.parse(data.line_items) : data.line_items,
  } as Quote;
}

export async function deleteQuote(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const quotes = getStoredData(STORAGE_KEYS.QUOTES, initialQuotes);
    const updatedQuotes = quotes.filter(q => q.id !== id);
    setStoredData(STORAGE_KEYS.QUOTES, updatedQuotes);
    return;
  }

  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Convert an accepted quote into a new Job/Appointment.
 * Returns the newly created Job.
 */
export async function convertQuoteToJob(quote: Quote, date: string, time: string): Promise<Job> {
  // Build a single service string from line items
  const serviceDescription = quote.line_items.map(li => li.description).join(', ');
  const job = await createJob({
    profile_id: quote.profile_id,
    customer_id: quote.customer_id,
    pet_id: quote.pet_id,
    date,
    time,
    service: serviceDescription,
    price: quote.total_amount,
    status: 'scheduled',
    notes: quote.notes,
  });
  // Mark quote as accepted (if not already) – silently ignore errors
  try {
    await updateQuote(quote.id, { status: 'accepted' });
  } catch {
    // best-effort
  }
  return job;
}

// Dashboard data operations
export interface DashboardData {
  todayJobs: Job[];
  weekJobs: Job[];
  monthJobs: Job[];
  weekRevenue: number;
  monthRevenue: number;
  outstandingInvoices: (Invoice & { job?: Job })[];
  outstandingAmount: number;
  pendingQuotes: Quote[];
  // Quick Start Checklist flags
  hasCustomer: boolean;
  hasAppointment: boolean;
  hasPaidInvoice: boolean;
}

export async function getDashboardData(profileId: string): Promise<DashboardData> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weekStartStr = startOfWeek.toISOString().split('T')[0];
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = startOfMonth.toISOString().split('T')[0];

  // Fetch all data in parallel
  const [allJobs, allInvoices, allCustomers, allQuotes] = await Promise.all([
    getJobs(profileId),
    getInvoices(profileId),
    getCustomers(profileId),
    getQuotes(profileId),
  ]);

  // Get all pets for lookup
  const petResults = await Promise.all(allCustomers.map(c => getPets(c.id)));
  const allPets = petResults.flat();

  // Build lookup maps
  const customerMap: Record<string, string> = {};
  allCustomers.forEach(c => { customerMap[c.id] = c.name; });
  const petMap: Record<string, string> = {};
  allPets.forEach(p => { petMap[p.id] = p.name; });

  // Helper to enrich job with names
  const enrichJob = (j: Job): Job => ({
    ...j,
    customer_name: customerMap[j.customer_id] || 'Unknown',
    pet_name: j.pet_id ? petMap[j.pet_id] || 'Unknown' : undefined,
  });

  // Today's jobs
  const todayJobs = allJobs.filter(j => j.date === todayStr).map(enrichJob);
  todayJobs.sort((a, b) => a.time.localeCompare(b.time));

  // This week's completed jobs
  const weekJobs = allJobs.filter(j => j.date >= weekStartStr && j.date <= todayStr && j.status === 'completed');

  // This month's completed jobs
  const monthJobs = allJobs.filter(j => j.date >= monthStartStr && j.date <= todayStr && j.status === 'completed');

  // Revenue calculations
  const weekRevenue = weekJobs.reduce((sum, j) => sum + j.price, 0);
  const monthRevenue = monthJobs.reduce((sum, j) => sum + j.price, 0);

  // Outstanding invoices with their jobs (enriched)
  const outstandingInvoices = allInvoices
    .filter(i => i.status === 'unpaid' || i.status === 'overdue')
    .map(invoice => {
      const job = allJobs.find(j => j.id === invoice.job_id);
      return { ...invoice, job: job ? enrichJob(job) : undefined };
    });

  const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + i.total_amount, 0);

  // Pending quotes (draft or sent – not yet accepted/declined)
  const pendingQuotes = allQuotes.filter(q => q.status === 'draft' || q.status === 'sent');

  // Quick Start Checklist flags for one-session goal
  const hasCustomer = allCustomers.length > 0;
  const hasAppointment = allJobs.length > 0;
  const hasPaidInvoice = allInvoices.some(i => i.status === 'paid');

  return {
    todayJobs,
    weekJobs,
    monthJobs,
    weekRevenue,
    monthRevenue,
    outstandingInvoices,
    outstandingAmount,
    pendingQuotes,
    hasCustomer,
    hasAppointment,
    hasPaidInvoice,
  };
}
