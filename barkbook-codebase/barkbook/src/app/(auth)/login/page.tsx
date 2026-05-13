'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Check if Supabase is configured
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = SUPABASE_URL.includes('supabase.co') && !SUPABASE_ANON_KEY.includes('your-anon');

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Demo mode - bypass login
        router.push('/dashboard');
        return;
      }

      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Check onboarding status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();
          
          if (profile && !profile.onboarding_completed) {
            router.push('/onboarding');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Bypass login in demo mode
    router.push('/dashboard');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
            placeholder="you@example.com"
            required={isSupabaseConfigured}
            disabled={!isSupabaseConfigured}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
            placeholder="••••••••"
            required={isSupabaseConfigured}
            disabled={!isSupabaseConfigured}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#2D9CDB] text-white font-medium rounded-lg hover:bg-[#2578A9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : isSupabaseConfigured ? 'Sign In' : 'Continue'}
        </button>
      </form>

      {!isSupabaseConfigured && (
        <div className="mt-4">
          <button
            onClick={handleDemoLogin}
            className="w-full py-3 px-4 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors"
          >
            🚀 Enter Demo Mode
          </button>
          <p className="mt-2 text-xs text-center text-gray-500">
            Demo mode with sample data (no login required)
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#2D9CDB] font-medium hover:underline">
          Sign up for BarkBook
        </Link>
      </p>
    </div>
  );
}
