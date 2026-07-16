import './Sidebar.css';
import { useState } from 'react';


const Sidebar = ({
  visible,
  currentPage,
  onNavigate,
  onLogout,
  userData
}) => {
  const roleId = userData?.roleId;
  const [expandedMenu, setExpandedMenu] = useState(null);

  // 🎯 Role-based access mapping
  const roleAccess = {
    1: ['dashboard', 'vehicle', 'users', 'adminUsers', 'supervisor', 'tickets', 'manageUserPage', 'reports', 'settings'], // Admin
    2: ['dashboard', 'tickets', 'reports'] // Supervisor
  };

  // 📋 Navigation items with submenu support
  const navItems = [
    { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
    { id: 'vehicle', icon: 'fas fa-truck',text: 'Vehicles'},
    { id: 'users',icon: 'fas fa-users',text: 'Users',
       submenu: [
    { id: 'adminUsers', icon: 'fas fa-users-cog', text: 'Admin Users' },
    { id: 'supervisor', icon: 'fas fa-user-tie', text: 'Supervisor' } ] },
    { id: 'tickets', icon: 'fas fa-ticket-alt', text: 'Tickets' },
    { id: 'manageUserPage', icon: 'fas fa-user-edit',text: 'Ticket Management' },
    { id: 'reports', icon: 'fas fa-chart-bar', text: 'Reports' },
    { id: 'settings', icon: 'fas fa-cog', text: 'Settings' }
  ];

  // 🔐 Filter menu based on role
  const filteredNavItems = navItems.filter(item => {
  const isItemAccessible = roleAccess[roleId]?.includes(item.id);
    
    // If item has submenu, filter submenu items as well
    if (item.submenu) {
      item.submenu = item.submenu.filter(subitem =>
        roleAccess[roleId]?.includes(subitem.id)
      );
    }
    
    return isItemAccessible;
  });

  const sidebarClass = visible ? 'sidebar show' : 'sidebar';

  const initials = `${userData?.firstName?.[0] || ''}${userData?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  // 🎯 Toggle submenu expansion
  const toggleSubmenu = (itemId) => {
    setExpandedMenu(expandedMenu === itemId ? null : itemId);
  };

  // 🎯 Handle menu item click
  const handleMenuClick = (itemId) => {
    onNavigate(itemId);
  };

  return (
    <div className={sidebarClass} id="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <i className="fas fa-shield-alt"></i>
        <h5>PackYatra</h5>
      </div>

      {/* Sidebar Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Menu</div>

        {/* 🔐 Role Based Menu */}
        {filteredNavItems.map(item => (
          <div key={item.id} className="nav-item-wrapper">
            <div className="nav-item-container">
              <a
                onClick={() => {
                  if (item.submenu && item.submenu.length > 0) {
                    toggleSubmenu(item.id);
                  } else {
                    handleMenuClick(item.id);
                  }
                }}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <i className={item.icon}></i>
                <span className="nav-text">{item.text}</span>
                
                {/* Dropdown arrow for items with submenu */}
                {item.submenu && item.submenu.length > 0 && (
                  <i
                    className={`fas fa-chevron-down submenu-icon ${
                      expandedMenu === item.id ? 'expanded' : ''
                    }`}
                  ></i>
                )}
              </a>
            </div>

            {/* Submenu Items */}
            {item.submenu && item.submenu.length > 0 && (
              <div
                className={`submenu ${expandedMenu === item.id ? 'show' : ''}`}
              >
                {item.submenu.map(subitem => (
                  <a
                    key={subitem.id}
                    onClick={() => handleMenuClick(subitem.id)}
                    className={`submenu-item ${
                      currentPage === subitem.id ? 'active' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className={subitem.icon}></i>
                    <span className="nav-text">{subitem.text}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>{initials}
            </div>
          </div>
          <div className="flex-grow-1 ms-3" style={{ minWidth: 0 }}>
            <p className="mb-0 fw-medium text-truncate">
              {userData?.firstName} {userData?.lastName}
            </p>
            <small className="text-white-50">
              {roleId === 1 ? 'Administrator' : 'Supervisor'}
            </small>
          </div>
          <a onClick={onLogout} className="text-white-50 ms-2" style={{ cursor: 'pointer' }} title="Log out" >
            <i className="fas fa-sign-out-alt"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;