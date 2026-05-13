'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-5 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐕</span>
            <span className="text-xl font-bold text-[#2D9CDB]">BarkBook</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-gray-600 font-medium hover:text-[#2D9CDB]">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            The Simpler Way to Run Your<br className="hidden md:block" /> Dog Grooming Business.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Say goodbye to paper diaries and WhatsApp chaos. BarkBook is the all-in-one business tool designed specifically for independent groomers. Manage appointments, clients, and invoices — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[#F2994A] text-white font-semibold rounded-lg text-lg hover:bg-[#D6822E] transition-colors shadow-md"
            >
              Start Your 14-Day Free Trial
            </Link>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 text-[#2D9CDB] font-semibold rounded-lg text-lg hover:underline transition-colors"
            >
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 py-16 bg-[#2D9CDB]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Running a salon shouldn&apos;t feel like herding cats (or stubborn bulldogs).
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Between grooming sessions, you&apos;re juggling phone calls, tracking payments on scraps of paper, and trying to remember which pup is allergic to what. BarkBook gives you your time back.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Everything you need to run your business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-5 p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl">🐾</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customer & Pet Management</h3>
                <p className="text-gray-600">Keep detailed profiles for every furry client. Store grooming notes, allergies, temperament, and contact details so you&apos;re always prepared.</p>
              </div>
            </div>
            <div className="flex gap-5 p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl">📅</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Effortless Scheduling</h3>
                <p className="text-gray-600">A clean, mobile-first calendar that lets you book appointments in seconds. See your week at a glance and never double-book again.</p>
              </div>
            </div>
            <div className="flex gap-5 p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl">📝</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Quotes</h3>
                <p className="text-gray-600">Send professional, branded quotes via PDF. Let your clients approve the price upfront, then convert accepted quotes into appointments with a single click.</p>
              </div>
            </div>
            <div className="flex gap-5 p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Invoicing & Payments</h3>
                <p className="text-gray-600">Generate professional invoices immediately after a groom. Track who has paid and who is overdue, and send PDF receipts directly to your clients&apos; phones.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BarkBook */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">Why BarkBook?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Built for Mobile</h3>
              <p className="text-gray-600">Manage your business from your phone while you&apos;re in the salon or on the go.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Clean & Minimal</h3>
              <p className="text-gray-600">No clunky menus or complex tutorials. It&apos;s so intuitive you&apos;ll be up and running in under 5 minutes.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Edge</h3>
              <p className="text-gray-600">Impress your clients with branded PDFs and timely communication.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 text-center mb-12">Choose the plan that fits your business.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solo Plan */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-[#2D9CDB] transition-colors">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Solo</h3>
                <p className="text-gray-500 mt-1">For independent, one-person grooming businesses</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">£49</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span> Unlimited Customers & Pets
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span> Full Calendar & Scheduling
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span> Invoicing & Quotes
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span> PDF Export
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-center bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Get Started
              </Link>
            </div>
            {/* Salon Plan */}
            <div className="border-2 border-[#2D9CDB] rounded-2xl p-8 bg-[#2D9CDB]/5">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Salon</h3>
                <p className="text-gray-500 mt-1">Designed for growing salons with multiple staff</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">£149</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span> Everything in Solo
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span> Multiple Staff Accounts <span className="text-xs bg-[#F2994A] text-white px-2 py-0.5 rounded">Coming Soon</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span> Advanced Business Insights
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="text-green-500">✓</span> Priority Support
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-center bg-[#F2994A] text-white font-semibold rounded-lg hover:bg-[#D6822E] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to spend more time grooming and less time on admin?
          </h2>
          <p className="text-gray-400 mb-8">Join the pack of professional groomers using BarkBook today.</p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-[#F2994A] text-white font-semibold rounded-lg text-lg hover:bg-[#D6822E] transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-lg">🐕</span>
            <span className="font-medium">BarkBook</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 BarkBook. Business management for dog groomers.</p>
        </div>
      </footer>
    </div>
  );
}