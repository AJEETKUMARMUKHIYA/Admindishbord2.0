import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../../AxiosClient';
import config from '../../config';
import './Dashboard.css';

// Import Chart.js for graphs
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
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Default chart data structure
const defaultChartData = {
  monthlyRevenue: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [45000, 52000, 48000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  },
  ticketStatusDistribution: {
    labels: ['Active', 'In Progress', 'Closed', 'Cancelled'],
    datasets: [{
      data: [24, 12, 156, 8],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(245, 158, 11)',
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 1
    }]
  },
  bookingTrends: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Bookings',
        data: [12, 19, 15, 25, 22, 18, 10],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 6
      }
    ]
  },
  paymentStatusData: {
    labels: ['Paid', 'Partially Paid', 'Unpaid', 'Refunded'],
    datasets: [{
      data: [120, 25, 10, 5],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(99, 102, 241, 0.8)'
      ],
      borderWidth: 1
    }]
  },
  locationWiseBookings: {
    labels: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'],
    datasets: [{
      label: 'Bookings',
      data: [45, 38, 52, 28, 34, 42],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(34, 197, 94, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(168, 85, 247, 0.7)',
        'rgba(14, 165, 233, 0.7)'
      ]
    }]
  }
};

// Chart options
const chartOptions = {
  revenueChart: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '₹' + context.parsed.y.toLocaleString('en-IN');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  },
  doughnutChart: {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  },
  barChart: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

const Dashboard = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
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
    avgResponseTime: '2.4h'
  });
const handleViewBooking = (booking) => {
  setSelectedBooking(booking);
  setShowBookingModal(true);
};
  const [recentBookings, setRecentBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [chartData, setChartData] = useState(defaultChartData);

  // Filter states
  const [bookingFilter, setBookingFilter] = useState({
    status: 'all',
    paymentStatus: 'all',
    search: '',
    dateRange: 'month',
  });
  
  const [ticketFilter, setTicketFilter] = useState({
    status: 'all',
    search: '',
    dateRange: 'month',
  });

  // Fetch data functions
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
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'N/A'),
        formattedPickupDate: booking.formattedPickupDate || 
          (booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
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

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ticketsData, bookingsData, statsData] = await Promise.all([
        fetchTickets(),
        fetchRecentBookings(),
        fetchDashboardStats()
      ]);

      setTickets(ticketsData);
      setRecentBookings(bookingsData);
      
      // Calculate stats
      const activeTicketsCount = ticketsData.filter(ticket => 
        ticket.status === 'Pending' || ticket.status === 'In Progress'
      ).length;
      
      const inProgressCount = ticketsData.filter(ticket => 
        ticket.status === 'In Progress'
      ).length;
      
      const closedThisMonthCount = ticketsData.filter(ticket => 
        ticket.status === 'Closed' && 
        new Date(ticket.createdAt).getMonth() === new Date().getMonth()
      ).length;
      
      const cancelledThisMonthCount = ticketsData.filter(ticket => 
        ticket.status === 'Cancelled' && 
        new Date(ticket.createdAt).getMonth() === new Date().getMonth()
      ).length;

      const newStats = {
        activeTickets: activeTicketsCount,
        inProgress: inProgressCount,
        closedThisMonth: closedThisMonthCount,
        cancelledThisMonth: cancelledThisMonthCount,
        newUsersWithoutToken: statsData.newUsersWithoutBooking || 0,
        activeSupervisors: statsData.activeSupervisors || 8,
        totalSupervisors: statsData.totalSupervisors || 12,
        totalBookings: statsData.totalBookings || 156,
        completedMoves: statsData.completedMoves || 89,
        totalRevenue: statsData.totalRevenue || 452500,
        avgResolutionTime: `${statsData.avgResolutionDays || 2.4} days`,
        customerSatisfaction: statsData.customerSatisfaction || '94%',
        avgResponseTime: `${statsData.avgResponseHours || 2.4} hours`
      };

      setStats(newStats);
      
      // Update chart data with actual stats
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
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  // Set mock data
  const setMockData = () => {
    const mockTickets = [
      {
        ticketID: 1,
        ticketNo: 'TKT-2024-001',
        bookingID: 101,
        userID: 1,
        fromLocation: 'Mumbai',
        toLocation: 'Pune',
        bookingAmount: 12500,
        status: 'Pending',
        createdAt: '2024-01-15T14:30:00',
        updatedAt: '2024-01-15T14:30:00',
        assignedSupervisorID: null
      }
    ];

    const mockBookings = [
      {
        bookingID: 101,
        ticketID: 1,
        ticketNo: 'TKT-2024-001',
        userName: 'Rahul Sharma',
        userEmail: 'rahul@example.com',
        userPhone: '+919876543210',
        pickupDate: '2024-01-20T00:00:00',
        formattedPickupDate: '20-Jan-2024',
        totalAmount: 12500.00,
        bookingAmountPaid: 12500.00,
        paymentPercentage: 100,
        bookingStatus: 'Confirmed',
        ticketStatus: 'Pending',
        fromLocation: 'Mumbai, Maharashtra',
        toLocation: 'Pune, Maharashtra',
        ticketCreated: '2024-01-15T14:30:00',
        formattedTicketDate: '15-Jan-2024 14:30',
        daysSincePickup: 3,
        paymentStatus: 'Paid',
        ticketAgeDays: 2,
        pendingAmount: 0
      },
      {
        bookingID: 102,
        ticketID: 2,
        ticketNo: 'TKT-2024-002',
        userName: 'Priya Patel',
        userEmail: 'priya@example.com',
        userPhone: '+919876543211',
        pickupDate: '2024-01-25T00:00:00',
        formattedPickupDate: '25-Jan-2024',
        totalAmount: 18500.00,
        bookingAmountPaid: 9250.00,
        paymentPercentage: 50,
        bookingStatus: 'In Progress',
        ticketStatus: 'In Progress',
        fromLocation: 'Delhi, Delhi',
        toLocation: 'Gurgaon, Haryana',
        ticketCreated: '2024-01-18T10:15:00',
        formattedTicketDate: '18-Jan-2024 10:15',
        daysSincePickup: -2,
        paymentStatus: 'Partially Paid',
        ticketAgeDays: 4,
        pendingAmount: 9250
      },
      {
        bookingID: 103,
        ticketID: 3,
        ticketNo: 'TKT-2024-003',
        userName: 'Amit Kumar',
        userEmail: 'amit@example.com',
        userPhone: '+919876543212',
        pickupDate: '2024-01-30T00:00:00',
        formattedPickupDate: '30-Jan-2024',
        totalAmount: 22500.00,
        bookingAmountPaid: 0,
        paymentPercentage: 0,
        bookingStatus: 'Pending',
        ticketStatus: 'New',
        fromLocation: 'Bangalore, Karnataka',
        toLocation: 'Chennai, Tamil Nadu',
        ticketCreated: '2024-01-22T09:45:00',
        formattedTicketDate: '22-Jan-2024 09:45',
        daysSincePickup: -7,
        paymentStatus: 'Unpaid',
        ticketAgeDays: 1,
        pendingAmount: 22500
      }
    ];

    const mockStats = {
      activeTickets: 24,
      inProgress: 12,
      closedThisMonth: 156,
      cancelledThisMonth: 8,
      newUsersWithoutToken: 42,
      activeSupervisors: 8,
      totalSupervisors: 12,
      totalBookings: 156,
      completedMoves: 89,
      totalRevenue: 452500,
      avgResolutionTime: '2.4 days',
      customerSatisfaction: '94%',
      avgResponseTime: '2.4h'
    };

    setTickets(mockTickets);
    setRecentBookings(mockBookings);
    setStats(mockStats);
    setChartData(defaultChartData);
  };

  // Handle refresh
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
    fetchDashboardData();
     const interval = setInterval(() => {
    fetchRecentBookings();
  }, 10000); // every 10 seconds

       return () => clearInterval(interval);
  }, []);

  // Filtered data
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

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (ticketFilter.status !== 'all' && ticket.status !== ticketFilter.status) return false;
      if (ticketFilter.search) {
        const searchLower = ticketFilter.search.toLowerCase();
        return (
          ticket.ticketNo?.toLowerCase().includes(searchLower) ||
          ticket.fromLocation?.toLowerCase().includes(searchLower) ||
          ticket.toLocation?.toLowerCase().includes(searchLower)
        );
      }
      if (ticketFilter.dateRange !== 'all') {
        const ticketDate = new Date(ticket.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now - ticketDate) / (1000 * 60 * 60 * 24));
        
        switch (ticketFilter.dateRange) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      }
      return true;
    });
  }, [tickets, ticketFilter]);

  // Enhanced StatCard Component - International Style
  const InternationalStatCard = ({ title, value, icon, color, trend, type = 'number', currency = '₹' }) => (
    <div className="intl-stat-card">
      <div className="stat-content">
        <div className="stat-header">
          <span className="stat-title">{title}</span>
          <div className="stat-icon-wrapper">
            <i className={`fas ${icon}`}></i>
          </div>
        </div>
        <div className="stat-value">
          {type === 'currency' ? currency : ''}
          <span className="value-number">{value}</span>
          {type === 'percentage' ? '%' : ''}
        </div>
        {trend && (
          <div className={`stat-trend ${trend.value > 0 ? 'positive' : 'negative'}`}>
            <i className={`fas fa-${trend.value > 0 ? 'arrow-up' : 'arrow-down'}`}></i>
            <span>{Math.abs(trend.value)}% {trend.period}</span>
          </div>
        )}
      </div>
    </div>
  );

  // International Table Total Revenue
  const InternationalBookingTable = () => (
    <div className="intl-table-container">
      <div className="table-header">
        <div className="header-left">
          <h3 className="table-title">
            <i className="fas fa-history"></i>
            <span>Recent Bookings</span>
          </h3>
          <span className="record-count">{filteredBookings.length} records</span>
        </div>
        <div className="header-right">
          <div className="table-filters">
            <div className="filter-group">
              <label>Status</label>
              <select 
                className="intl-select"
                value={bookingFilter.status}
                onChange={(e) => setBookingFilter(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Payment</label>
              <select 
                className="intl-select"
                value={bookingFilter.paymentStatus}
                onChange={(e) => setBookingFilter(prev => ({ ...prev, paymentStatus: e.target.value }))}
              >
                <option value="all">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            <div className="search-group">
              <div className="intl-search">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={bookingFilter.search}
                  onChange={(e) => setBookingFilter(prev => ({ ...prev, search: e.target.value }))}
                />
                {bookingFilter.search && (
                  <button 
                    className="clear-search"
                    onClick={() => setBookingFilter(prev => ({ ...prev, search: '' }))}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="table-section intl-table-scope">
      <div className="table-scroll-container">
        <table className="intl-data-table">
          <thead>
            <tr>      
               <th className="col-customer">
                <div className="table-header-cell">
                  <span>Customer</span>
                  <i className="fas fa-sort"></i>
                </div>
              </th>
              <th className="col-ticket">
                <div className="table-header-cell">
                  <span>Ticket</span>
                </div>
              </th>
              <th className="col-booking">
                <div className="table-header-cell">
                  <span>Booking ID</span>
                </div>
              </th>
              <th className="col-route">
                <div className="table-header-cell">
                  <span>Route</span>
                </div>
              </th>
              <th className="col-pickup">
                <div className="table-header-cell">
                  <span>Pickup Date</span>
                  <i className="fas fa-sort"></i>
                </div>
              </th>
              <th className="col-ticket-date">
                <div className="table-header-cell">
                  <span>Ticket Created</span>
                </div>
              </th>
              <th className="col-amount">
                <div className="table-header-cell">
                  <span>Amount</span>
                </div>
              </th>
              <th className="col-payment">
                <div className="table-header-cell">
                  <span>Payment %</span>
                </div>
              </th>
              <th className="col-status">
                <div className="table-header-cell">
                  <span>Status</span>
                </div>
              </th>
              <th className="col-actions">
                <div className="table-header-cell">
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.slice(0, 10).map((booking, index) => (
              <tr key={index} className="data-row">      
                <td className="col-customer">
                  <div className="customer-cell">
                    <div className="customer-avatar">
                      {booking.userName?.charAt(0) || 'U'}
                    </div>
                    <div className="customer-details">
                      <div className="customer-name">{booking.userName}</div>
                      <div className="customer-email">{booking.userEmail}</div>
                      <div className='customer-phone'>{booking.userPhone}</div>
                    </div>
                  </div>
                </td>
                <td className="col-ticket">
                  <div className="ticket-cell">
                    <span className="ticket-number">{booking.ticketNo}</span>
                  </div>
                </td>
                <td className="col-booking">
                  <div className="booking-id">{booking.quotationNumber}</div>
                </td>
                <td className="col-route">
                  <div className="route-cell">
                    <div className="route-from">{booking.fromLocation}</div>
                    <div className="route-arrow">→</div>
                    <div className="route-to">{booking.toLocation}</div>
                  </div>
                </td>
                <td className="col-pickup">
                  <div className="date-cell">
                    <div className="date-value">{booking.formattedPickupDate}</div>
                  </div>
                </td>
                <td className="col-ticket-date">
                  <div className="date-cell">
                    <div className="date-value">{booking.formattedTicketDate}</div>
                  </div>
                </td>
                <td className="col-amount">
                  <div className="amount-cell">
                    <div className="amount-total">
                      <span className="amount-label">Total:</span>
                      <span className="amount-value">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="amount-paid">
                      <span className="amount-label">Paid:</span>
                      <span className="amount-value">₹{booking.bookingAmountPaid?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </td>
                <td className="col-payment">
                  <div className="payment-cell">
                    <div className="payment-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${booking.paymentPercentage}%` }}
                        data-value={booking.paymentPercentage}
                      ></div>
                    </div>
                    <div className="payment-percentage">{booking.paymentPercentage}%</div>
                  </div>
                </td>
                <td className="col-status">
                  <div className={`status-badge status-${booking.bookingStatus.toLowerCase().replace(' ', '-')}`}>
                    {booking.bookingStatus}
                  </div>
                </td>
                <td className="col-actions">
                  <div className="actions-cell">
                    <button 
                     className="action-btn view-btn"
                     onClick={() => handleViewBooking(booking)}
                     title="View Details"
                    >
                    <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <h4>No bookings found</h4>
          <p>Try adjusting your filters or search criteria</p>
          <button 
            className="btn-clear-filters"
            onClick={() => setBookingFilter({
              status: 'all',
              paymentStatus: 'all',
              search: '',
              dateRange: 'month',
            })}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="table-footer">
          <div className="footer-left">
            <div className="pagination-info">
              Showing <strong>1-{Math.min(10, filteredBookings.length)}</strong> of <strong>{filteredBookings.length}</strong> bookings
            </div>
          </div>
          <div className="footer-right">
            <div className="pagination-controls">
              <button className="pagination-btn" >
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="page-info">Page 1 of 1</span>
              <button className="pagination-btn">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
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
          <p className="mt-3">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard" className="page active">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>PackYatra Dashboard Overview</h1>
            <p className="subtitle">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="header-actions">
            <button 
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        
        <InternationalStatCard
          title="Active Tickets"
          value={stats.activeTickets}
          icon="fa-ticket-alt"
          color="primary"
          trend={{ value: -5.2, period: 'vs yesterday' }}
        />
        <InternationalStatCard
          title="New Inquiry"
          value={24}
          icon="fa-ticket-alt"
          color="warning"
          trend={{ value: 8.3, period: 'vs last week' }}
        />
        <InternationalStatCard
          title="Satisfaction Rate"
          value={94}
          icon="fa-smile"
          color="info"
          trend={{ value: 2.1, period: 'vs last month' }}
          type="percentage"
        />
        <InternationalStatCard
          title="Total Revenue"
          value={stats.totalRevenue.toLocaleString('en-IN')}
          icon="fa-rupee-sign"
          color="success"
          trend={{ value: 12.5, period: 'vs last month' }}
          type="currency"
        />
      </div>
{/* Charts Grid - Single Row */}
<div className="charts-grid-single-row">
  {/* Revenue Analytics - Large */}
  <div className="chart-card revenue-large">
    <div className="chart-header">
      <h3>Revenue Analytics</h3>
    </div>
    <div className="chart-body">
      {chartData.monthlyRevenue?.datasets && (
        <Line
          data={chartData.monthlyRevenue}
          options={chartOptions.revenueChart}
          height={250}
        />
      )}
    </div>
  </div>

  {/* Ticket Distribution */}
  <div className="chart-card">
    <div className="chart-header">
      <h3>Ticket Distribution</h3>
    </div>
    <div className="chart-body">
      {chartData.ticketStatusDistribution?.datasets && (
        <Doughnut
          data={chartData.ticketStatusDistribution}
          options={chartOptions.doughnutChart}
          height={200}
        />
      )}
    </div>
  </div>

  {/* Payment Status */}
  <div className="chart-card">
    <div className="chart-header">
      <h3>Payment Status</h3>
    </div>
    <div className="chart-body">
      {chartData.paymentStatusData?.datasets && (
        <Pie
          data={chartData.paymentStatusData}
          options={chartOptions.doughnutChart}
          height={200}
        />
      )}
    </div>
  </div>
</div>


      {/* International Table */}
      <div className="table-section">
        <InternationalBookingTable />
      </div>
{/* ================= Booking Details Popup ================= */}
{showBookingModal && selectedBooking && (
  <div className="modal-overlay">
    <div className="modal-box">

      <div className="modal-header">
        <h3>Booking Details</h3>
        <button
          className="modal-close"
          onClick={() => setShowBookingModal(false)}
        >
          ×
        </button>
      </div>

      <div className="modal-body">

        <div className="modal-row">
          <span>Customer Name</span>
          <strong>{selectedBooking.userName}</strong>
        </div>

        <div className="modal-row">
          <span>Email</span>
          <strong>{selectedBooking.userEmail}</strong>
        </div>

        <div className="modal-row">
          <span>Phone</span>
          <strong>{selectedBooking.userPhone}</strong>
        </div>

        <div className="modal-row">
          <span>Ticket No</span>
          <strong>{selectedBooking.ticketNo}</strong>
        </div>

        <div className="modal-row">
          <span>Booking ID</span>
          <strong>#{selectedBooking.bookingID}</strong>
        </div>

        <div className="modal-row">
          <span>Route</span>
          <strong>
            {selectedBooking.fromLocation} → {selectedBooking.toLocation}
          </strong>
        </div>

        <div className="modal-row">
          <span>Pickup Date</span>
          <strong>{selectedBooking.formattedPickupDate}</strong>
        </div>

        <div className="modal-row">
          <span>Total Amount</span>
          <strong>
            ₹{selectedBooking.totalAmount?.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="modal-row">
          <span>Paid Amount</span>
          <strong>
            ₹{selectedBooking.bookingAmountPaid?.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="modal-row">
          <span>Payment Status</span>
          <strong>{selectedBooking.paymentStatus}</strong>
        </div>

        <div className="modal-row">
          <span>Booking Status</span>
          <strong>{selectedBooking.bookingStatus}</strong>
        </div>

      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Dashboard;