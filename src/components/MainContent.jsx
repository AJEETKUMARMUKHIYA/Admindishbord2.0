import Dashboard from './Dashboard/Dashboard';
import Supervisor from './Supervisor/Supervisor';
import Tickets from './Tickets/Tickets';
import AdminUsers from './AdminUsers/AdminUsers';
import Reports from './Reports/report';
import Vehicle from './Vehicle/Vehicle';
import ManageUserPage from '../admin/Users/ManageUserPage';
import Settings from './Settings';
import { useEffect, useState } from 'react';

const MainContent = ({
  sidebarVisible,
  currentPage,
  supervisors,
  tickets,
  adminUsers,
  stats,
  onAddSupervisor,
  onToggleSupervisor,
  onDeleteSupervisor,
  onAssignTicket,
  onUpdateTicket,
  onRefreshData,
  userData
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mainStyle = {
    marginLeft: sidebarVisible && !isMobile ? 'var(--sidebar-width)' : '0',
    padding: '25px',
    transition: 'all 0.3s ease',
    paddingTop: isMobile ? '80px' : '25px',
    //width: '100%',
    minHeight: '100vh'
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            onRefresh={onRefreshData}
            userData={userData}
          />
        );
      case 'supervisor':
        return (
          <Supervisor
            supervisors={supervisors}
            onAddSupervisor={onAddSupervisor}
            onToggleSupervisor={onToggleSupervisor}
            onDeleteSupervisor={onDeleteSupervisor}
            onRefresh={onRefreshData}
          />
        );
      case 'tickets':
        return (
          <Tickets
            tickets={tickets}
            supervisors={supervisors}
            onAssignTicket={onAssignTicket}
            onUpdateTicket={onUpdateTicket}
            onRefresh={onRefreshData}
          />
        );
      case 'adminUsers':
        return (
          <AdminUsers
            adminUsers={adminUsers}
            onRefresh={onRefreshData}
          />
        );
      case 'reports':
        return <Reports />;
      case 'vehicle':
        return <Vehicle/>;
      case 'manageUserPage'  :
        return <ManageUserPage/>
      case 'settings':
        return <Settings />;
      
      default:
        return <Dashboard stats={stats} onRefresh={onRefreshData} />;
    }
  };

  return (
    <div className="main" style={mainStyle}>
      {renderPage()}
      <div className="footer-text">
        <p>PackYatra Admin Dashboard v2.0 • © 2025 All rights reserved</p>
      </div>
    </div>
  );
};

export default MainContent;