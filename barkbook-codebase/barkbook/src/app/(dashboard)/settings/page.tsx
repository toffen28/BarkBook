'use client';

import { useState, useEffect } from 'react';
import type { Profile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Mock data for MVP
      const mockProfile: Profile = {
        id: '1',
        email: 'groomer@example.com',
        business_name: "Pam's Pups Grooming",
        created_at: '2024-01-01',
      };
      setProfile(mockProfile);
      setBusinessName(mockProfile.business_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProfile({ ...profile!, business_name: businessName });
      setSaved(true);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your business details</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile?.email || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 bg-gray-50 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#2D9CDB] focus:border-transparent"
                placeholder="Your business name"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="text-green-600 font-medium">✓ Saved!</span>
            )}
          </div>
        </div>
      </form>

      {/* Supabase Config Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Connection</h2>
        <p className="text-gray-600 mb-4">
          BarkBook uses Supabase for data storage. Configure your connection in the <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-700">
          <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
          <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <button
          onClick={() => {
            // TODO: Implement logout
          }}
          className="px-6 py-3 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
