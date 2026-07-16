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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

/* ── Design tokens (mirrored as CSS vars in Dashboard.css) ── */
const TOKENS = {
  cobalt: '#2A4BD8',
  amber: '#E9A23B',
  success: '#1F9D6C',
  danger: '#D64545',
  slate: '#626B85',
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
        backgroundColor: 'rgba(42, 75, 216, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
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
        backgroundColor: '#14192B',
        titleFont: { family: 'IBM Plex Mono', size: 11 },
        bodyFont: { family: 'IBM Plex Mono', size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (ctx) => `₹${ctx.parsed.y.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: TOKENS.slate } },
      y: {
        beginAtZero: true,
        grid: { color: '#E3E5EC' },
        ticks: { font: { size: 11 }, color: TOKENS.slate, callback: (v) => `₹${(v / 1000)}k` }
      }
    }
  },
  doughnutChart: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 11, family: 'Inter' }, boxWidth: 8, usePointStyle: true, padding: 12 }
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
  const fetchRecentBookings = async () => {
    try {
      const response = await axiosClient.get(config.urls.dashboardRecentBookings);

      
// Only keep records where Ticket_distribution === "Active"
const bookingsData = (response.data?.data || []).filter(
  b => b.ticketdistribution === "Active"
);
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
      const [bookingsData, statsData] = await Promise.all([
        fetchRecentBookings(),
        fetchDashboardStats()
      ]);

      setRecentBookings(bookingsData);

      const activeTicketsCount = bookingsData.filter(ticket =>
        ticket.bookingStatus === 'Pending' || ticket.bookingStatus === 'In Progress'
      ).length;

      const inProgressCount = bookingsData.filter(ticket =>
        ticket.bookingStatus === 'In Progress'
      ).length;

      const closedThisMonthCount = bookingsData.filter(ticket =>
        ticket.bookingStatus === 'Closed' &&
        new Date(ticket.createdAt).getMonth() === new Date().getMonth()
      ).length;

      const cancelledThisMonthCount = bookingsData.filter(ticket =>
        ticket.bookingStatus === 'Cancelled' &&
        new Date(ticket.createdAt).getMonth() === new Date().getMonth()
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
    const interval = setInterval(() => {
      fetchRecentBookings();
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

  const StatCard = ({ title, value, icon, trend, type = 'number', currency = '₹' }) => (
    <div className="stat-card-v2">
      <span className="stat-card-v2__tab" />
      <div className="stat-card-v2__top">
        <span className="stat-card-v2__label">{title}</span>
        <div className="stat-card-v2__icon">
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
      <div className="stat-card-v2__value">
        {type === 'currency' ? currency : ''}
        <span>{value}</span>
        {type === 'percentage' ? '%' : ''}
      </div>
      {trend && (
        <div className={`stat-card-v2__trend ${trend.value >= 0 ? 'is-up' : 'is-down'}`}>
          <i className={`fas fa-${trend.value >= 0 ? 'arrow-up' : 'arrow-down'}`}></i>
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
        <i className="fas fa-truck route-cell__truck"></i>
        <span className="route-cell__dash" />
        <span className="route-cell__dot route-cell__dot--dest" />
      </span>
      <span className="route-cell__code">{shortCode(to)}</span>
    </div>
  );

  const BookingManifestTable = () => (
    <div className="manifest">
      <div className="manifest__header">
        <div>
          <h3 className="manifest__title"><i className="fas fa-history"></i> Booking manifest</h3>
          <span className="manifest__count">{filteredBookings.length} records</span>
        </div>
        <div className="manifest__filters">
          <div className="filter-group">
            <label>Status</label>
            <select
              className="v2-select"
              value={bookingFilter.status}
              onChange={(e) => setBookingFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All status</option>
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
              <option value="all">All payments</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div className="v2-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search manifest…"
              value={bookingFilter.search}
              onChange={(e) => setBookingFilter(prev => ({ ...prev, search: e.target.value }))}
            />
            {bookingFilter.search && (
              <button className="v2-search__clear" onClick={() => setBookingFilter(prev => ({ ...prev, search: '' }))}>
                <i className="fas fa-times"></i>
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
              <th>Ticket</th>
              <th>Booking ID</th>
              <th>Route</th>
              <th>Pickup date</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((booking, index) => (
              <tr key={booking.bookingID ?? index}>
                <td>
                  <div className="customer-cell">
                    <div className="customer-cell__avatar">{booking.userName?.charAt(0) || 'U'}</div>
                    <div>
                      <div className="customer-cell__name">{booking.userName}</div>
                      <div className="customer-cell__meta">{booking.userEmail}</div>
                      <div className="customer-cell__meta">{booking.userPhone}</div>
                    </div>
                  </div>
                </td>
                <td><span className="mono-tag">{booking.ticketNo}</span></td>
                <td><span className="mono-tag">{booking.quotationNumber}</span></td>
                <td><RouteCell from={booking.fromLocation} to={booking.toLocation} /></td>
                <td className="mono-cell">{booking.formattedPickupDate}</td>
                <td>
                  <div className="amount-cell">
                    <span className="mono-cell">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                    <span className="amount-cell__paid">Paid ₹{booking.bookingAmountPaid?.toLocaleString('en-IN')}</span>
                  </div>
                </td>
                <td>
                  <div className="payment-cell">
                    <div className="payment-cell__bar">
                      <span style={{ width: `${booking.paymentPercentage}%` }} />
                    </div>
                    <span className="payment-cell__pct">{booking.paymentPercentage}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-pill status-pill--${booking.bookingStatus?.toLowerCase().replace(' ', '-')}`}>
                    {booking.bookingStatus}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <button className="icon-btn" title="View details" onClick={() => handleViewBooking(booking)}>
                      <i className="fas fa-eye"></i>
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
          <div className="empty-state__icon"><i className="fas fa-clipboard-list"></i></div>
          <h4>No bookings found</h4>
          <p>Try adjusting your filters or search criteria</p>
          <button
            className="btn-clear-filters"
            onClick={() => setBookingFilter({ status: 'all', paymentStatus: 'all', search: '', dateRange: 'month' })}
          >
            Clear all filters
          </button>
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="manifest__footer">
          <div className="pagination-info">
            Showing <strong>{(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredBookings.length)}</strong> of <strong>{filteredBookings.length}</strong>
          </div>
          <div className="pagination-controls">
            <button className="icon-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="pagination-controls__page">Page {currentPage} of {totalPages}</span>
            <button className="icon-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <i className="fas fa-chevron-right"></i>
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
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard…</p>
        </div>
      </div>
    );
  }
  // Derived, dynamically-bound display values
  const satisfactionValue = parseInt(stats.customerSatisfaction, 10) || 0;

  return (
    <div id="dashboard" className="page active dashboard-v2">
      {/* Header */}
      <div className="dashboard-v2__header">
        <div>
          <div className="dashboard-v2__eyebrow">Operations · Control Tower</div>
          <h1>PackYatra Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <button className="refresh-btn-v2" onClick={handleRefresh} disabled={loading}>
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          <span>{loading ? 'Refreshing…' : 'Refresh data'}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid-v2">
        {canView('activeTickets') && (
          <StatCard
            title="Active tickets"
            value={stats.activeTickets}
            icon="fa-ticket-alt"
            trend={stats.trends?.activeTickets}
          />
        )}
        {canView('newInquiry') && (
          <StatCard
            title="New inquiry"
            value={stats.newUsersWithoutToken}
            icon="fa-inbox"
            trend={stats.trends?.newInquiry}
          />
        )}
        {canView('satisfaction') && (
          <StatCard
            title="Satisfaction rate"
            value={satisfactionValue}
            icon="fa-smile"
            trend={stats.trends?.satisfaction}
            type="percentage"
          />
        )}
        {canView('revenue') && (
          <StatCard
            title="Total revenue"
            value={stats.totalRevenue.toLocaleString('en-IN')}
            icon="fa-rupee-sign"
            trend={stats.trends?.revenue}
            type="currency"
          />
        )}
      </div>

      {/* Charts */}
      <div className="charts-grid-v2">
        {userData?.roleId === 1 && (
          <div className="chart-card-v2 chart-card-v2--wide">
            <h3>Revenue analytics</h3>
            <div className="chart-card-v2__body">
              {chartData.monthlyRevenue?.datasets && (
                <Line data={chartData.monthlyRevenue} options={chartOptions.revenueChart} />
              )}
            </div>
          </div>
        )}

        <div className="chart-card-v2">
          <h3>Ticket distribution</h3>
          <div className="chart-card-v2__body"
          >      
            {chartData.ticketStatusDistribution?.datasets && (
              <Doughnut data={chartData.ticketStatusDistribution} options={chartOptions.doughnutChart} />
            )}
          </div>
        </div>

        <div className="chart-card-v2">
          <h3>Payment status</h3>
          <div className="chart-card-v2__body">
            {chartData.paymentStatusData?.datasets && (
              <Pie data={chartData.paymentStatusData} options={chartOptions.doughnutChart} />
            )}
          </div>
        </div>
      </div>

      {/* Manifest table */}
      <BookingManifestTable />

      {/* Booking detail modal */}
      {showBookingModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-box-v2" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box-v2__header">
              <h3>Booking details</h3>
              <button className="modal-close-v2" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            <RouteCell from={selectedBooking.fromLocation} to={selectedBooking.toLocation} />
            <div className="modal-box-v2__body">
              <div className="modal-row-v2"><span>Customer name</span><strong>{selectedBooking.userName}</strong></div>
              <div className="modal-row-v2"><span>Email</span><strong>{selectedBooking.userEmail}</strong></div>
              <div className="modal-row-v2"><span>Phone</span><strong>{selectedBooking.userPhone}</strong></div>
              <div className="modal-row-v2"><span>Ticket no</span><strong>{selectedBooking.ticketNo}</strong></div>
              <div className="modal-row-v2"><span>Booking ID</span><strong>#{selectedBooking.bookingID}</strong></div>
              <div className="modal-row-v2"><span>Route</span><strong>{selectedBooking.fromLocation} → {selectedBooking.toLocation}</strong></div>
              <div className="modal-row-v2"><span>Pickup date</span><strong>{selectedBooking.formattedPickupDate}</strong></div>
              <div className="modal-row-v2"><span>Total amount</span><strong>₹{selectedBooking.totalAmount?.toLocaleString('en-IN')}</strong></div>
              <div className="modal-row-v2"><span>Paid amount</span><strong>₹{selectedBooking.bookingAmountPaid?.toLocaleString('en-IN')}</strong></div>
              <div className="modal-row-v2"><span>Payment status</span><strong>{selectedBooking.paymentStatus}</strong></div>
              <div className="modal-row-v2"><span>Booking status</span><strong>{selectedBooking.bookingStatus}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
