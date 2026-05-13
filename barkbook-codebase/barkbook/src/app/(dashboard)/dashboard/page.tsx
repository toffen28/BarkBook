'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getDashboardData, getProfileId } from '@/lib/data';
import type { DashboardData } from '@/lib/data';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const profileId = await getProfileId();
      if (!profileId) {
        // Not logged in, redirect to login
        router.push('/login');
        return;
      }

      const data = await getDashboardData(profileId);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Start Checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Start Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={dashboardData.hasCustomer ? "/customers" : "/customers/new"}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
              dashboardData.hasCustomer 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-[#2D9CDB]'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              dashboardData.hasCustomer ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {dashboardData.hasCustomer ? '✓' : '1'}
            </div>
            <div>
              <div className="font-medium text-gray-900">Add Customer</div>
              <div className="text-sm text-gray-500">
                {dashboardData.hasCustomer ? 'Customer added!' : 'Add your first customer'}
              </div>
            </div>
          </Link>

          <Link
            href={dashboardData.hasAppointment ? "/calendar" : "/jobs/new"}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
              dashboardData.hasAppointment 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-[#2D9CDB]'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              dashboardData.hasAppointment ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {dashboardData.hasAppointment ? '✓' : '2'}
            </div>
            <div>
              <div className="font-medium text-gray-900">Book Appointment</div>
              <div className="text-sm text-gray-500">
                {dashboardData.hasAppointment ? 'Appointment scheduled!' : 'Schedule your first job'}
              </div>
            </div>
          </Link>

          <Link
            href={dashboardData.hasPaidInvoice ? "/invoices" : "/invoices/new"}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
              dashboardData.hasPaidInvoice 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-[#2D9CDB]'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              dashboardData.hasPaidInvoice ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {dashboardData.hasPaidInvoice ? '✓' : '3'}
            </div>
            <div>
              <div className="font-medium text-gray-900">Invoice & Get Paid</div>
              <div className="text-sm text-gray-500">
                {dashboardData.hasPaidInvoice ? 'Invoice marked as paid!' : 'Create invoice & mark paid'}
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s your business overview.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/customers/new"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            ➕ Add Customer
          </Link>
          <Link
            href="/quotes/new"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            📋 Create Quote
          </Link>
          <Link
            href="/jobs/new"
            className="px-4 py-2 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors"
          >
            📅 Book Appointment
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="text-3xl font-bold text-[#2D9CDB]">{dashboardData.todayJobs.length}</div>
          <div className="text-sm text-gray-600 mt-1">Today&apos;s Appointments</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="text-3xl font-bold text-green-600">{formatCurrency(dashboardData.weekRevenue)}</div>
          <div className="text-sm text-gray-600 mt-1">This Week</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(dashboardData.monthRevenue)}</div>
          <div className="text-sm text-gray-600 mt-1">This Month</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="text-3xl font-bold text-[#F2994A]">{dashboardData.outstandingInvoices.length}</div>
          <div className="text-sm text-gray-600 mt-1">Outstanding ({formatCurrency(dashboardData.outstandingAmount)})</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="text-3xl font-bold text-purple-600">{dashboardData.pendingQuotes.length}</div>
          <div className="text-sm text-gray-600 mt-1">Pending Quotes</div>
        </div>
      </div>

      {/* Upcoming Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h2>
          <Link href="/calendar" className="text-sm text-[#2D9CDB] hover:underline font-medium">
            View Calendar →
          </Link>
        </div>
        
        {dashboardData.todayJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No appointments today</p>
            <Link
              href="/jobs/new"
              className="text-[#2D9CDB] hover:underline font-medium"
            >
              Book your first appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {dashboardData.todayJobs.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-medium text-gray-900 min-w-[60px]">
                      {formatTime(job.time)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{job.customer_name}</div>
                      <div className="text-sm text-gray-600">{job.pet_name || 'No pet'} • {job.service}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(job.price)}</div>
                    <div className="text-sm text-gray-600 capitalize">{job.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          href="/customers"
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#2D9CDB] transition-colors"
        >
          <div className="text-2xl mb-2">👥</div>
          <div className="font-medium text-gray-900">Customers</div>
          <div className="text-sm text-gray-600">Manage clients & pets</div>
        </Link>

        <Link
          href="/calendar"
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#2D9CDB] transition-colors"
        >
          <div className="text-2xl mb-2">📅</div>
          <div className="font-medium text-gray-900">Calendar</div>
          <div className="text-sm text-gray-600">View & book jobs</div>
        </Link>

        <Link
          href="/quotes"
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#2D9CDB] transition-colors"
        >
          <div className="text-2xl mb-2">📋</div>
          <div className="font-medium text-gray-900">Quotes</div>
          <div className="text-sm text-gray-600">Send & track quotes</div>
        </Link>

        <Link
          href="/invoices"
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#2D9CDB] transition-colors"
        >
          <div className="text-2xl mb-2">📄</div>
          <div className="font-medium text-gray-900">Invoices</div>
          <div className="text-sm text-gray-600">Track payments</div>
        </Link>

        <Link
          href="/settings"
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#2D9CDB] transition-colors"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <div className="font-medium text-gray-900">Settings</div>
          <div className="text-sm text-gray-600">Business details</div>
        </Link>
      </div>
    </div>
  );
}
