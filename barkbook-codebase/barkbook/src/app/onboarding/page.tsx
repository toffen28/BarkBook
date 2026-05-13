'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = SUPABASE_URL.includes('supabase.co') && !SUPABASE_ANON_KEY.includes('your-anon');

type Step = 'details' | 'plan' | 'success';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'solo' | 'salon'>('solo');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login');
    });
  }, []);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('plan');
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!isSupabaseConfigured) {
      setCurrentStep('success');
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        business_name: businessName,
        phone,
        subscription_plan: selectedPlan,
        onboarding_completed: true
      }).eq('id', user.id);
    }
    setCurrentStep('success');
    setLoading(false);
  };

  if (currentStep === 'success') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900">You are all set!</h2>
        <button onClick={() => router.push('/dashboard')} className="mt-6 w-full py-3 bg-[#F2994A] text-white rounded-lg">Go to Dashboard →</button>
      </div>
    );
  }

  if (currentStep === 'plan') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
        <form onSubmit={handlePlanSubmit} className="space-y-4">
          <label className={`block p-6 border-2 rounded-xl cursor-pointer ${selectedPlan === 'solo' ? 'border-[#2D9CDB] bg-[#2D9CDB]/5' : 'border-gray-200'}`}>
            <input type="radio" name="plan" value="solo" checked={selectedPlan === 'solo'} onChange={() => setSelectedPlan('solo')} className="sr-only" />
            <div className="flex justify-between">
              <div><h3 className="font-semibold">Solo</h3><p className="text-sm text-gray-600">For independent groomers</p></div>
              <div className="text-right"><span className="text-2xl font-bold">£49</span><span className="text-gray-500">/mo</span></div>
            </div>
          </label>
          <label className={`block p-6 border-2 rounded-xl cursor-pointer ${selectedPlan === 'salon' ? 'border-[#2D9CDB] bg-[#2D9CDB]/5' : 'border-gray-200'}`}>
            <input type="radio" name="plan" value="salon" checked={selectedPlan === 'salon'} onChange={() => setSelectedPlan('salon')} className="sr-only" />
            <div className="flex justify-between">
              <div><h3 className="font-semibold">Salon</h3><p className="text-sm text-gray-600">For growing businesses</p></div>
              <div className="text-right"><span className="text-2xl font-bold">£149</span><span className="text-gray-500">/mo</span></div>
            </div>
          </label>
          <div className="flex gap-4">
            <button type="button" onClick={() => setCurrentStep('details')} className="flex-1 py-3 border border-gray-300 rounded-lg">← Back</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#F2994A] text-white rounded-lg">{loading ? 'Saving...' : 'Complete →'}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Details</h2>
      <p className="text-gray-600 mb-6">This info appears on your invoices.</p>
      <form onSubmit={handleDetailsSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
          <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Pam's Pups Grooming" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="07700 900123" required />
        </div>
        <button type="submit" className="w-full py-3 bg-[#F2994A] text-white rounded-lg">Continue →</button>
      </form>
    </div>
  );
}
