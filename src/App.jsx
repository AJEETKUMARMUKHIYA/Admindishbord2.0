import { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/MainContent';
import { showToast } from './components/ToastNotification';
import axiosClient from './AxiosClient';
import config from './config';
import './styles/global.css';
import { Toaster } from 'sonner';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);

  const [supervisors, setSupervisors] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [stats, setStats] = useState({
    activeTickets: 0,
    inProgress: 0,
    closedThisMonth: 0,
    cancelledThisMonth: 0,
    newUsersWithoutToken: 0,
    activeSupervisors: 0,
    totalSupervisors: 0
  });
  const [loading, setLoading] = useState(false);

  // Responsive sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      setSidebarVisible(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load dashboard after login
  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ticketsRes, supervisorsRes, adminUsersRes] = await Promise.all([
        fetchTickets(),
        fetchSupervisors(),
        fetchAdminUsers()
      ]);

      setTickets(ticketsRes);
      setSupervisors(supervisorsRes);
      setAdminUsers(adminUsersRes);
      calculateStats(ticketsRes, supervisorsRes);

      showToast.success('Dashboard data loaded successfully!');
    } catch (error) {
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axiosClient.get(config.urls.tickets);
      return res.data || [];
    } catch {
      return [];
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await axiosClient.get(config.urls.supervisors);
      return res.data || [];
    } catch {
      return [];
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await axiosClient.get(config.urls.adminUsers);
      return res.data || [];
    } catch {
      return [];
    }
  };

  const calculateStats = (ticketsData, supervisorsData) => {
    setStats({
      activeTickets: ticketsData.filter(t => t.status === 'New').length,
      inProgress: ticketsData.filter(t => t.status === 'In Progress').length,
      closedThisMonth: ticketsData.filter(t => t.status === 'Closed').length,
      cancelledThisMonth: ticketsData.filter(t => t.status === 'Cancelled').length,
      newUsersWithoutToken: 0,
      activeSupervisors: supervisorsData.filter(s => s.active).length,
      totalSupervisors: supervisorsData.length
    });
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUserData(user);
    showToast.success(`Welcome back, ${user.firstName}!`);
  };

  

  // ✅ FIXED: Logout popup shows only once
  const handleLogout = () => {
    showToast.warning('Are you sure you want to logout?', {
      duration: 0,
      action: {
        label: 'Yes, Logout',
        onClick: () => {
          localStorage.clear();
          setIsLoggedIn(false);
          setUserData(null);
          setTickets([]);
          setSupervisors([]);
          setAdminUsers([]);
          showToast.info('Logged out successfully');
        }
      },
      cancel: {
        label: 'Cancel'
      }
    });
  };

  const toggleSidebar = () => setSidebarVisible(v => !v);

  const showPage = (page) => {
    setCurrentPage(page);
    if (isMobile) setSidebarVisible(false);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      {/* ✅ SINGLE toast container */}
      <Toaster position="top-right" richColors />

      <div id="adminPanel">
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <i className="fa fa-bars"></i>
        </button>

        <Sidebar
          visible={sidebarVisible}
          currentPage={currentPage}
          onNavigate={showPage}
          onLogout={handleLogout}
          userData={userData}
        />

        <MainContent
          sidebarVisible={sidebarVisible}
          currentPage={currentPage}
          supervisors={supervisors}
          tickets={tickets}
          adminUsers={adminUsers}
          stats={stats}
          loading={loading}
          onRefreshData={fetchDashboardData}
          userData={userData}
        />
      </div>
    </>
  );
}

export default App;
