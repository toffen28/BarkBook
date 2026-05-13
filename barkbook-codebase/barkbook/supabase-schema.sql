-- BarkBook Database Schema
-- For Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  subscription_plan TEXT DEFAULT 'solo' CHECK (subscription_plan IN ('solo', 'salon')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pets table (linked to customers)
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  age INTEGER,
  temperament TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs/Appointments table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  service TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  line_items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue')),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Customers: Users can only see/edit their own customers
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Pets: Users manage pets through customer access
CREATE POLICY "Users can view own pets" ON pets
  FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)));

CREATE POLICY "Users can insert own pets" ON pets
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)));

CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE USING (customer_id IN (SELECT id FROM customers WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)));

CREATE POLICY "Users can delete own pets" ON pets
  FOR DELETE USING (customer_id IN (SELECT id FROM customers WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)));

-- Jobs: Users can only see/edit their own jobs
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Quotes: Users can only see/edit their own quotes
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can insert own quotes" ON quotes
  FOR INSERT WITH CHECK (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own quotes" ON quotes
  FOR UPDATE USING (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can delete own quotes" ON quotes
  FOR DELETE USING (profile_id = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Invoices: Users can only see/edit their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (job_id IN (SELECT id FROM jobs WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)));

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (job_id IN (SELECT id FROM jobs WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)));

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (job_id IN (SELECT id FROM jobs WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)));

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (job_id IN (SELECT id FROM jobs WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)));

-- Functions

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (id, email, business_name, phone, subscription_plan, onboarding_completed)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'solo'),
    FALSE
  );
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
