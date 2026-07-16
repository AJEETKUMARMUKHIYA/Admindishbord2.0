import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../../AxiosClient';
import config from '../../config';
import './Dashboard.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Pie } from 'react-chartjs-2';

import { 
  Ticket, 
  Inbox, 
  Smile, 
  TrendingUp, 
  TrendingDown,
  RefreshCw, 
  Search, 
  X, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  ArrowRight,
  ClipboardList,
  User,
  Calendar,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Truck,
  ShieldAlert,
  CreditCard,
  CheckCircle,
  HelpCircle,
  Phone
} from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

/* ── Design tokens (mirrored as CSS vars in Dashboard.css) ── */
const TOKENS = {
  cobalt: '#2563eb',
  amber: '#d97706',
  success: '#10b981',
  danger: '#ef4444',
  slate: '#64748b',
};

// Default chart data — restyled palette, same structure/shape as before
const defaultChartData = {
  monthlyRevenue: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [45000, 52000, 48000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000],
        borderColor: TOKENS.cobalt,
        backgroundColor: 'rgba(37, 99, 235, 0.06)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
        borderWidth: 2.5,
      }
    ]
  },
  ticketStatusDistribution: {
    labels: ['Active', 'In Progress', 'Closed', 'Cancelled'],
    datasets: [{
      data: [24, 12, 156, 500],
      backgroundColor: [TOKENS.cobalt, TOKENS.amber, TOKENS.success, TOKENS.danger],
      borderColor: '#ffffff',
      borderWidth: 2,
    }]
  },
  paymentStatusData: {
    labels: ['Paid', 'Partially Paid', 'Unpaid', 'Refunded'],
    datasets: [{
      data: [120, 25, 10, 5],
      backgroundColor: [TOKENS.success, TOKENS.amber, TOKENS.danger, TOKENS.cobalt],
      borderColor: '#ffffff',
      borderWidth: 2,
    }]
  }
};

const chartOptions = {
  revenueChart: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0f172a',
        titleFont: { family: 'Space Grotesk', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { font: { family: 'Inter', size: 11 }, color: '#64748b' } 
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { 
          font: { family: 'Inter', size: 11 }, 
          color: '#64748b', 
          callback: (v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}` 
        }
      }
    }
  },
  doughnutChart: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          font: { size: 11, family: 'Inter', weight: '600' }, 
          boxWidth: 8, 
          usePointStyle: true, 
          padding: 16,
          color: '#334155'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        borderRadius: 8,
        titleFont: { family: 'Space Grotesk', size: 12 },
        bodyFont: { family: 'Inter', size: 12 }
      }
    }
  }
};

const Dashboard = ({ userData }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [stats, setStats] = useState({
    activeTickets: 0,
    inProgress: 0,
    closedThisMonth: 0,
    cancelledThisMonth: 0,
    newUsersWithoutToken: 0,
    activeSupervisors: 8,
    totalSupervisors: 12,
    totalBookings: 156,
    completedMoves: 89,
    totalRevenue: 452500,
    avgResolutionTime: '2.4 days',
    customerSatisfaction: '94%',
    avgResponseTime: '2.4h',
    trends: {
      activeTickets: null,
      newInquiry: null,
      satisfaction: null,
      revenue: null,
    }
  });

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const [recentBookings, setRecentBookings] = useState([]);
  const [chartData, setChartData] = useState(defaultChartData);

  const [bookingFilter, setBookingFilter] = useState({
    status: 'all',
    paymentStatus: 'all',
    search: '',
    dateRange: 'month',
  });

  // ── Fetch functions ─────────────────────────────────────────────────
  const fetchTickets = async () => {
    try {
      const response = await axiosClient.get(config.urls.tickets);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const response = await axiosClient.get(config.urls.dashboardRecentBookings);
      const bookingsData = response.data?.data || [];

      return bookingsData.map(booking => ({
        ...booking,
        ticketCreated: booking.ticketCreated || booking.createdAt || new Date().toISOString(),
        bookingAmountPaid: booking.bookingAmountPaid || booking.paidAmount || 0,
        formattedTicketDate: booking.formattedTicketDate ||
          (booking.ticketCreated ? new Date(booking.ticketCreated).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
          }) : 'N/A'),
        formattedPickupDate: booking.formattedPickupDate ||
          (booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
          }) : 'N/A'),
        paymentPercentage: booking.totalAmount && booking.bookingAmountPaid
          ? Math.round((booking.bookingAmountPaid / booking.totalAmount) * 100)
          : booking.paymentStatus === 'Paid' ? 100 : 0
      }));

    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      return [];
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axiosClient.get(config.urls.dashboardStats);
      return response.data?.data || {};
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {};
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ticketsData, bookingsData, statsData] = await Promise.all([
        fetchTickets(),
        fetchRecentBookings(),
        fetchDashboardStats()
      ]);

      setRecentBookings(bookingsData);

      const activeTicketsCount = ticketsData.filter(ticket =>
        ticket.status === 'Open' || ticket.status === 'In Progress' || ticket.status === 'Pending' || ticket.status === 'New'
      ).length;

      const inProgressCount = ticketsData.filter(ticket =>
        ticket.status === 'In Progress'
      ).length;

      const closedThisMonthCount = ticketsData.filter(ticket =>
        ticket.status === 'Closed'
      ).length;

      const cancelledThisMonthCount = ticketsData.filter(ticket =>
        ticket.status === 'Cancelled'
      ).length;

      const newStats = {
        activeTickets: activeTicketsCount,
        inProgress: inProgressCount,
        closedThisMonth: closedThisMonthCount,
        cancelledThisMonth: cancelledThisMonthCount,
        newUsersWithoutToken: statsData.newUsersWithoutBooking || 0,
        activeSupervisors: statsData.activeSupervisors || 0,
        totalSupervisors: statsData.totalSupervisors || 0,
        totalBookings: statsData.totalBookings || 0,
        completedMoves: statsData.completedMoves || 0,
        totalRevenue: statsData.totalRevenue || 0,
        avgResolutionTime: `${statsData.avgResolutionDays || 0.0} days`,
        customerSatisfaction: statsData.customerSatisfaction || '00%',
        avgResponseTime: `${statsData.avgResponseHours || 0.0} hours`,
        trends: {
          activeTickets: statsData.trends?.activeTickets ?? null,
          newInquiry: statsData.trends?.newInquiry ?? null,
          satisfaction: statsData.trends?.satisfaction ?? null,
          revenue: statsData.trends?.revenue ?? null,
        }
      };

      setStats(newStats);

      setChartData(prev => ({
        ...prev,
        ticketStatusDistribution: {
          ...prev.ticketStatusDistribution,
          datasets: [{
            ...prev.ticketStatusDistribution.datasets[0],
            data: [activeTicketsCount, inProgressCount, closedThisMonthCount, cancelledThisMonthCount]
          }]
        }
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [bookingFilter]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(async () => {
      const bookings = await fetchRecentBookings();
      setRecentBookings(bookings);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const roleId = userData?.roleId;

  const statsAccess = {
    1: ['activeTickets', 'newInquiry', 'satisfaction', 'revenue'], // Admin
    2: ['activeTickets', 'newInquiry', 'satisfaction'], // Supervisor
    3: ['activeTickets'] // Basic User
  };

  const canView = (card) => statsAccess[roleId]?.includes(card);

  const filteredBookings = useMemo(() => {
    return recentBookings.filter(booking => {
      if (bookingFilter.status !== 'all' && booking.bookingStatus !== bookingFilter.status) return false;
      if (bookingFilter.paymentStatus !== 'all' && booking.paymentStatus !== bookingFilter.paymentStatus) return false;

      if (bookingFilter.dateRange !== 'all' && booking.ticketCreated) {
        const ticketDate = new Date(booking.ticketCreated);
        const now = new Date();
        const diffDays = Math.floor((now - ticketDate) / (1000 * 60 * 60 * 24));

        switch (bookingFilter.dateRange) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      }

      if (bookingFilter.search) {
        const searchLower = bookingFilter.search.toLowerCase();
        return (
          booking.userName?.toLowerCase().includes(searchLower) ||
          booking.userEmail?.toLowerCase().includes(searchLower) ||
          booking.ticketNo?.toLowerCase().includes(searchLower) ||
          booking.fromLocation?.toLowerCase().includes(searchLower) ||
          booking.toLocation?.toLowerCase().includes(searchLower) ||
          booking.bookingID?.toString().includes(searchLower)
        );
      }
      return true;
    });
  }, [recentBookings, bookingFilter]);

  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredBookings.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredBookings, currentPage]);

  // ── Small presentational helpers ────────────────────────────────────

  // Turns "Mumbai, Maharashtra" into a short waybill-style code, e.g. "MUM"
  const shortCode = (location) => {
    if (!location) return '—';
    const city = location.split(',')[0].trim();
    return city.slice(0, 3).toUpperCase();
  };

  const StatCard = ({ title, value, icon: IconComponent, trend, type = 'number', currency = '₹', iconColor, iconBg }) => (
    <div className="stat-card-v2">
      <span className="stat-card-v2__tab" style={{ backgroundColor: iconColor }} />
      <div className="stat-card-v2__top">
        <div className="stat-card-v2__info">
          <span className="stat-card-v2__label">{title}</span>
          <div className="stat-card-v2__value">
            {type === 'currency' ? currency : ''}
            <span>{value}</span>
            {type === 'percentage' ? '%' : ''}
          </div>
        </div>
        <div className="stat-card-v2__icon" style={{ backgroundColor: iconBg, color: iconColor }}>
          <IconComponent size={18} />
        </div>
      </div>
      {trend && (
        <div className={`stat-card-v2__trend ${trend.value >= 0 ? 'is-up' : 'is-down'}`}>
          {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(trend.value)}% {trend.period}</span>
        </div>
      )}
    </div>
  );

  const RouteCell = ({ from, to }) => (
    <div className="route-cell">
      <span className="route-cell__code">{shortCode(from)}</span>
      <span className="route-cell__line">
        <span className="route-cell__dot route-cell__dot--origin" />
        <span className="route-cell__dash" />
        <Truck size={12} className="route-cell__truck" />
        <span className="route-cell__dash" />
        <span className="route-cell__dot route-cell__dot--dest" />
      </span>
      <span className="route-cell__code">{shortCode(to)}</span>
    </div>
  );

  const BookingManifestTable = () => (
    <div className="manifest">
      <div className="manifest__header">
        <div className="manifest__title-group">
          <h3 className="manifest__title">
            <ClipboardList size={16} /> Booking Manifest
          </h3>
          <span className="manifest__count">{filteredBookings.length} records found</span>
        </div>
        
        <div className="manifest__filters">
          <div className="filter-group">
            <label>Status</label>
            <select
              className="v2-select"
              value={bookingFilter.status}
              onChange={(e) => setBookingFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Payment</label>
            <select
              className="v2-select"
              value={bookingFilter.paymentStatus}
              onChange={(e) => setBookingFilter(prev => ({ ...prev, paymentStatus: e.target.value }))}
            >
              <option value="all">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          
          <div className="v2-search">
            <Search size={14} className="v2-search__icon" />
            <input
              type="text"
              placeholder="Search manifest…"
              value={bookingFilter.search}
              onChange={(e) => setBookingFilter(prev => ({ ...prev, search: e.target.value }))}
            />
            {bookingFilter.search && (
              <button type="button" className="v2-search__clear" onClick={() => setBookingFilter(prev => ({ ...prev, search: '' }))}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="manifest__scroll">
        <table className="manifest-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Ticket Ref</th>
              <th>Booking ID</th>
              <th>Logistical Route</th>
              <th>Pickup Date</th>
              <th>Amount Details</th>
              <th>Payment Clear</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((booking, index) => (
              <tr key={booking.bookingID ?? index}>
                <td>
                  <div className="customer-cell">
                    <div className="customer-cell__avatar">{booking.userName?.charAt(0) || 'U'}</div>
                    <div className="customer-cell__info">
                      <div className="customer-cell__name">{booking.userName}</div>
                      <div className="customer-cell__meta">{booking.userEmail}</div>
                    </div>
                  </div>
                </td>
                <td><span className="mono-tag">{booking.ticketNo}</span></td>
                <td><span className="mono-tag">#{booking.bookingID}</span></td>
                <td><RouteCell from={booking.fromLocation} to={booking.toLocation} /></td>
                <td className="mono-cell">{booking.formattedPickupDate}</td>
                <td>
                  <div className="amount-cell">
                    <span className="mono-cell text-semibold">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                    <span className="amount-cell__paid">Paid: ₹{booking.bookingAmountPaid?.toLocaleString('en-IN')}</span>
                  </div>
                </td>
                <td>
                  <div className="payment-cell">
                    <div className="payment-cell__bar">
                      <span style={{ width: `${booking.paymentPercentage}%` }} />
                    </div>
                    <span className="payment-cell__pct">{booking.paymentPercentage}% Clear</span>
                  </div>
                </td>
                <td>
                  <span className={`status-pill status-pill--${booking.bookingStatus?.toLowerCase().replace(' ', '-')}`}>
                    {booking.bookingStatus}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <button type="button" className="icon-btn" title="View details" onClick={() => handleViewBooking(booking)}>
                      <Eye size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">
            <ClipboardList size={38} />
          </div>
          <h4>No bookings found</h4>
          <p>Try adjusting your search query or filters.</p>
          <button
            type="button"
            className="btn-clear-filters"
            onClick={() => setBookingFilter({ status: 'all', paymentStatus: 'all', search: '', dateRange: 'month' })}
          >
            Clear Filters
          </button>
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="manifest__footer">
          <div className="pagination-info">
            Showing <strong>{(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredBookings.length)}</strong> of <strong>{filteredBookings.length}</strong>
          </div>
          <div className="pagination-controls">
            <button type="button" className="icon-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft size={14} />
            </button>
            <span className="pagination-controls__page">Page {currentPage} of {totalPages}</span>
            <button type="button" className="icon-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading && !stats.activeTickets) {
    return (
      <div id="dashboard" className="page active">
        <div className="loading-spinner text-center py-5">
          <RefreshCw size={24} className="vm-spin" style={{ color: '#2563eb' }} />
          <p className="mt-3">Querying command center data…</p>
        </div>
      </div>
    );
  }

  const satisfactionValue = parseInt(stats.customerSatisfaction, 10) || 0;

  return (
    <div id="dashboard" className="page active dashboard-v2">
      
      {/* Header Eyebrow and Title */}
      <div className="dashboard-v2__header">
        <div className="dashboard-v2__header-left">
          <div className="dashboard-v2__eyebrow">
            <ShieldAlert size={12} /> Operations · Command Center
          </div>
          <h1 className="dashboard-v2__title">PackYatra Administrative Command</h1>
          <p className="dashboard-v2__subtitle">Welcome back! Real-time telemetry, operational metrics, and field manifest directory logs are operational.</p>
        </div>
        <button className="refresh-btn-v2" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'vm-spin' : ''} />
          <span>{loading ? 'Re-syncing…' : 'Sync Command Telemetry'}</span>
        </button>
      </div>

      {/* Stats Cards Dashboard Grid */}
      <div className="stats-grid-v2">
        {canView('activeTickets') && (
          <StatCard
            title="Active Operational Tickets"
            value={stats.activeTickets}
            icon={Ticket}
            trend={stats.trends?.activeTickets}
            iconColor="#2563eb"
            iconBg="#eff6ff"
          />
        )}
        {canView('newInquiry') && (
          <StatCard
            title="New User Enquiries"
            value={stats.newUsersWithoutToken}
            icon={Inbox}
            trend={stats.trends?.newInquiry}
            iconColor="#d97706"
            iconBg="#fefbeb"
          />
        )}
        {canView('satisfaction') && (
          <StatCard
            title="Client Satisfaction Rating"
            value={satisfactionValue}
            icon={Smile}
            trend={stats.trends?.satisfaction}
            type="percentage"
            iconColor="#10b981"
            iconBg="#ecfdf5"
          />
        )}
        {canView('revenue') && (
          <StatCard
            title="Consolidated Revenue Logs"
            value={stats.totalRevenue.toLocaleString('en-IN')}
            icon={DollarSign}
            trend={stats.trends?.revenue}
            type="currency"
            iconColor="#7c3aed"
            iconBg="#f5f3ff"
          />
        )}
      </div>

      {/* Analytical Charts Grid */}
      <div className="charts-grid-v2">
        {userData?.roleId === 1 && (
          <div className="chart-card-v2 chart-card-v2--wide">
            <h3>Revenue Logistical Analytics</h3>
            <div className="chart-card-v2__body">
              {chartData.monthlyRevenue?.datasets && (
                <Line data={chartData.monthlyRevenue} options={chartOptions.revenueChart} />
              )}
            </div>
          </div>
        )}

        <div className="chart-card-v2">
          <h3>Active Ticket Breakdown</h3>
          <div className="chart-card-v2__body">      
            {chartData.ticketStatusDistribution?.datasets && (
              <Doughnut data={chartData.ticketStatusDistribution} options={chartOptions.doughnutChart} />
            )}
          </div>
        </div>

        <div className="chart-card-v2">
          <h3>Payment Collection Analysis</h3>
          <div className="chart-card-v2__body">
            {chartData.paymentStatusData?.datasets && (
              <Pie data={chartData.paymentStatusData} options={chartOptions.doughnutChart} />
            )}
          </div>
        </div>
      </div>

      {/* Main Field Manifest Directory */}
      <BookingManifestTable />

      {/* Booking detailed information modal */}
      {showBookingModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-box-v2" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box-v2__header">
              <h3>Manifest Details: #{selectedBooking.bookingID}</h3>
              <button className="modal-close-v2" onClick={() => setShowBookingModal(false)}>
                <X size={16} />
              </button>
            </div>
            
            <div className="modal-box-v2__route-container">
              <RouteCell from={selectedBooking.fromLocation} to={selectedBooking.toLocation} />
            </div>

            <div className="modal-box-v2__body">
              <div className="modal-row-v2">
                <span><User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#64748b' }} /> Customer Name</span>
                <strong>{selectedBooking.userName}</strong>
              </div>
              <div className="modal-row-v2">
                <span>Email Address</span>
                <strong style={{ fontSize: '11px', textTransform: 'none' }}>{selectedBooking.userEmail}</strong>
              </div>
              {selectedBooking.userPhone && (
                <div className="modal-row-v2">
                  <span><Phone size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#64748b' }} /> Phone Contact</span>
                  <strong>{selectedBooking.userPhone}</strong>
                </div>
              )}
              <div className="modal-row-v2">
                <span>Ticket Reference</span>
                <strong className="mono-badge">{selectedBooking.ticketNo}</strong>
              </div>
              <div className="modal-row-v2">
                <span>Origin Address</span>
                <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={selectedBooking.fromLocation}>
                  {selectedBooking.fromLocation}
                </strong>
              </div>
              <div className="modal-row-v2">
                <span>Destination Address</span>
                <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={selectedBooking.toLocation}>
                  {selectedBooking.toLocation}
                </strong>
              </div>
              <div className="modal-row-v2">
                <span><Calendar size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#64748b' }} /> Pickup Schedule</span>
                <strong>{selectedBooking.formattedPickupDate}</strong>
              </div>
              
              <div className="modal-row-v2 modal-row-v2--highlight">
                <span>Consolidated Amount</span>
                <strong>₹{selectedBooking.totalAmount?.toLocaleString('en-IN')}</strong>
              </div>
              <div className="modal-row-v2">
                <span>Amount Deposited</span>
                <strong>₹{selectedBooking.bookingAmountPaid?.toLocaleString('en-IN')}</strong>
              </div>
              
              <div className="modal-row-v2">
                <span>Payment Clear Percentage</span>
                <strong>{selectedBooking.paymentPercentage}%</strong>
              </div>

              <div className="modal-row-v2">
                <span>Booking Duty Status</span>
                <span className={`status-pill status-pill--${selectedBooking.bookingStatus?.toLowerCase().replace(' ', '-')}`}>
                  {selectedBooking.bookingStatus}
                </span>
              </div>
            </div>
            
            <div className="modal-box-v2__footer">
              <button type="button" className="btn-modal-dismiss" onClick={() => setShowBookingModal(false)}>
                Dismiss Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
