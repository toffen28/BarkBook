'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getJob, updateJob, getCustomer, getPet, deleteJob } from '@/lib/data';
import type { Job, Customer, Pet } from '@/lib/types';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchJobData();
  }, [params.id]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const jobData = await getJob(params.id as string);
      if (!jobData) {
        setError('Appointment not found');
        return;
      }
      
      setJob(jobData);
      
      // Fetch customer
      if (jobData.customer_id) {
        const customerData = await getCustomer(jobData.customer_id);
        setCustomer(customerData);
      }
      
      // Fetch pet
      if (jobData.pet_id) {
        const petData = await getPet(jobData.pet_id);
        setPet(petData);
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    if (!job) return;
    
    try {
      setUpdating(true);
      await updateJob(job.id, { status: newStatus });
      setJob({ ...job, status: newStatus });
    } catch (err) {
      console.error('Error updating job status:', err);
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      await deleteJob(job.id);
      router.push('/calendar');
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete appointment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Appointment not found'}
        <Link href="/calendar" className="block mt-2 text-[#2D9CDB] hover:underline">
          Back to calendar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/calendar" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
        >
          🗑️ Delete
        </button>
      </div>

      {/* Job Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Service</h2>
            <div className="text-2xl font-bold text-[#2D9CDB]">{job.service}</div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Date</div>
            <div className="font-medium text-gray-900">{formatDate(job.date)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Time</div>
            <div className="font-medium text-gray-900">{job.time}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Price</div>
            <div className="font-medium text-gray-900">{formatCurrency(job.price)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Customer</div>
            <div className="font-medium text-gray-900">{customer?.name || 'N/A'}</div>
          </div>
          {pet && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Pet</div>
              <div className="font-medium text-gray-900">{pet.name} ({pet.breed})</div>
            </div>
          )}
        </div>

        {job.notes && (
          <div className="mt-6">
            <div className="text-sm text-gray-600 mb-1">Notes</div>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{job.notes}</div>
          </div>
        )}
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusChange('scheduled')}
            disabled={updating || job.status === 'scheduled'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              job.status === 'scheduled'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            📅 Scheduled
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={updating || job.status === 'completed'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              job.status === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ✓ Completed
          </button>
          <button
            onClick={() => handleStatusChange('cancelled')}
            disabled={updating || job.status === 'cancelled'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              job.status === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ✕ Cancelled
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {job.status === 'completed' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <Link
            href={`/invoices/new?job=${job.id}`}
            className="px-4 py-2 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors inline-flex items-center"
          >
            📄 Create Invoice
          </Link>
        </div>
      )}
    </div>
  );
}
