'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getJobsForDateRange, getProfileId } from '@/lib/data';
import type { Job } from '@/lib/types';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchJobs();
  }, [currentDate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileId = await getProfileId();
      if (!profileId) {
        setJobs([]);
        return;
      }

      // Calculate date range for the current month view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      const jobsData = await getJobsForDateRange(profileId, startDate, endDate);
      setJobs(jobsData);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    // Add padding days from previous month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add padding days from next month to complete 6 rows
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return jobs.filter(job => job.date === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const selectedDateJobs = getJobsForDate(new Date(selectedDate));
  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your appointments</p>
        </div>
        <Link
          href="/jobs/new"
          className="px-4 py-2 bg-[#F2994A] text-white font-medium rounded-lg hover:bg-[#D6822E] transition-colors inline-flex items-center justify-center"
        >
          📅 Book Appointment
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayJobs = getJobsForDate(day);
              const dateStr = day.toISOString().split('T')[0];
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    p-2 min-h-[60px] rounded-lg text-left transition-colors
                    ${!isCurrentMonth(day) ? 'text-gray-300' : 'text-gray-700'}
                    ${isToday(day) ? 'bg-[#2D9CDB] text-white hover:bg-[#2578A9]' : 'hover:bg-gray-50'}
                    ${selectedDate === dateStr ? 'ring-2 ring-[#2D9CDB]' : ''}
                  `}
                >
                  <div className="text-sm font-medium">{day.getDate()}</div>
                  {dayJobs.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayJobs.slice(0, 2).map((job) => (
                        <div
                          key={job.id}
                          className={`text-xs truncate ${
                            isToday(day) ? 'text-white' : 'text-[#2D9CDB]'
                          }`}
                        >
                          {formatTime(job.time)} {job.pet_name || 'Pet'}
                        </div>
                      ))}
                      {dayJobs.length > 2 && (
                        <div className={`text-xs ${
                          isToday(day) ? 'text-white' : 'text-gray-500'
                        }`}>
                          +{dayJobs.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          {selectedDateJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-2xl mb-2">📅</div>
              <p>No appointments</p>
              <Link
                href={`/jobs/new?date=${selectedDate}`}
                className="mt-2 text-[#2D9CDB] hover:underline text-sm inline-block"
              >
                Book one now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateJobs.map((job) => (
                <div key={job.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{formatTime(job.time)}</span>
                    <span className="text-sm font-medium text-[#F2994A]">{formatCurrency(job.price)}</span>
                  </div>
                  <div className="text-sm text-gray-700">{job.customer_name || 'Customer'}</div>
                  <div className="text-sm text-gray-500">{job.pet_name || 'Pet'} • {job.service}</div>
                  <div className={`mt-1 text-xs capitalize ${
                    job.status === 'completed' ? 'text-green-600' :
                    job.status === 'scheduled' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {job.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
