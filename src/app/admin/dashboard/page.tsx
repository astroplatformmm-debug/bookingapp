'use client';
// src/app/admin/dashboard/page.tsx

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Calendar, Users, IndianRupee, TrendingUp, LogOut, Search,
  CheckCircle2, XCircle, Clock, RefreshCw, Sparkles, Plus, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { BookingType } from '@/types';
import { formatPrice, formatDate, formatTime, cn } from '@/lib/utils';

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  todayBookings: number;
  monthBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  monthRevenue: number;
}

type FilterStatus = 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'slots'>('bookings');
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Rahul Raj Astro';

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setStats(data);
  }, [router]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      status: filterStatus,
      search,
    });
    const res = await fetch(`/api/admin/bookings?${params}`);
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setBookings(data.bookings);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, [page, filterStatus, search, router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatusChange = async (bookingId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchBookings();
      fetchStats();
    } else {
      toast.error('Failed to update booking');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const statusBadge = (status: string) => {
    if (status === 'CONFIRMED') return <span className="badge badge-green">Confirmed</span>;
    if (status === 'PENDING') return <span className="badge badge-yellow">Pending</span>;
    if (status === 'CANCELLED') return <span className="badge badge-red">Cancelled</span>;
    return <span className="badge badge-gray">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="hero-gradient px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-saffron" />
          <span className="font-display text-white">{businessName}</span>
          <span className="text-deep-400 text-sm hidden sm:block">— Admin</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-deep-300 hover:text-white text-sm transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Calendar className="w-5 h-5 text-deep-500" />} label="This Month" value={stats.monthBookings} sub="bookings" />
            <StatCard icon={<Users className="w-5 h-5 text-emerald-500" />} label="Today" value={stats.todayBookings} sub="confirmed" />
            <StatCard icon={<IndianRupee className="w-5 h-5 text-saffron" />} label="Month Revenue" value={formatPrice(stats.monthRevenue)} sub="collected" />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-500" />} label="Total Revenue" value={formatPrice(stats.totalRevenue)} sub="all time" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('bookings')}
            className={cn('px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
              activeTab === 'bookings' ? 'bg-deep-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300')}
          >
            Bookings ({total})
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={cn('px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
              activeTab === 'slots' ? 'bg-deep-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300')}
          >
            <Plus className="w-4 h-4 inline mr-1" />Manage Slots
          </button>
        </div>

        {activeTab === 'bookings' && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-deep-400"
                  placeholder="Search by name, email, phone..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="flex gap-2">
                {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'] as FilterStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s); setPage(1); }}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                      filterStatus === s ? 'bg-deep-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                    )}
                  >
                    {s}
                  </button>
                ))}
                <button onClick={fetchBookings} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="py-16 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading bookings...
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  No bookings found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Customer', 'Service', 'Date & Time', 'Amount', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{b.customerName}</div>
                            <div className="text-xs text-gray-400">{b.customerEmail}</div>
                            <div className="text-xs text-gray-400">{b.customerPhone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-700">{b.service?.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-700 whitespace-nowrap">
                              {b.slot && formatDate(b.slot.date + 'T00:00:00')}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {b.slot && formatTime(b.slot.startTime)}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-saffron">
                            {formatPrice(b.amountPaid)}
                          </td>
                          <td className="px-4 py-3">
                            {statusBadge(b.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {b.status !== 'CONFIRMED' && (
                                <button
                                  onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                                  title="Confirm"
                                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {b.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => {
                                    if (confirm('Cancel this booking?')) handleStatusChange(b.id, 'CANCELLED');
                                  }}
                                  title="Cancel"
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Page {page} of {totalPages} ({total} total)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => p - 1)}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'slots' && <SlotManager />}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span></div>
      <div className="font-display text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}

function SlotManager() {
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const TIME_OPTIONS = [
    { start: '09:00', end: '10:00' }, { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' }, { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' }, { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' }, { start: '17:00', end: '18:00' },
    { start: '18:00', end: '19:00' }, { start: '19:00', end: '20:00' },
  ];

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices);
  }, []);

  const toggleTime = (start: string) => {
    setSelectedTimes(prev =>
      prev.includes(start) ? prev.filter(t => t !== start) : [...prev, start]
    );
  };

  const handleCreate = async () => {
    if (!serviceId || !date || !selectedTimes.length) {
      toast.error('Select service, date, and at least one time slot');
      return;
    }
    setLoading(true);
    const slots = selectedTimes.map(start => ({
      startTime: start,
      endTime: TIME_OPTIONS.find(t => t.start === start)?.end || '',
    }));
    const res = await fetch('/api/admin/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, date, slots }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`${data.created} slot(s) created`);
      setSelectedTimes([]);
    } else {
      toast.error(data.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg">
      <h3 className="font-display text-lg text-gray-800 mb-5">Add Availability Slots</h3>
      <div className="space-y-4">
        <div>
          <label className="label">Service</label>
          <select
            className="input-field"
            value={serviceId}
            onChange={e => setServiceId(e.target.value)}
          >
            <option value="">Select a service</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input-field"
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Time Slots</label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_OPTIONS.map(t => (
              <button
                key={t.start}
                onClick={() => toggleTime(t.start)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all',
                  selectedTimes.includes(t.start)
                    ? 'bg-deep-500 text-white border-deep-500'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {formatTime(t.start)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create {selectedTimes.length > 0 ? `${selectedTimes.length} ` : ''}Slot{selectedTimes.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
