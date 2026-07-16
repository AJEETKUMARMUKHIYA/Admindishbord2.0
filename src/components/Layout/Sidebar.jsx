import './Sidebar.css';
import { useState } from 'react';
import { 
  Home, 
  Truck, 
  Users, 
  UserSquare2, 
  UserCheck, 
  Ticket, 
  FolderEdit, 
  BarChart3, 
  Settings as SettingsIcon, 
  Shield, 
  LogOut,
  ChevronDown
} from 'lucide-react';


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
    { id: 'dashboard', icon: Home, text: 'Dashboard' },
    { id: 'vehicle', icon: Truck, text: 'Vehicles' },
    { 
      id: 'users', 
      icon: Users, 
      text: 'Users',
      submenu: [
        { id: 'adminUsers', icon: UserSquare2, text: 'Admin Users' },
        { id: 'supervisor', icon: UserCheck, text: 'Supervisor' } 
      ] 
    },
    { id: 'tickets', icon: Ticket, text: 'Tickets' },
    { id: 'manageUserPage', icon: FolderEdit, text: 'Ticket Management' },
    { id: 'reports', icon: BarChart3, text: 'Reports' },
    { id: 'settings', icon: SettingsIcon, text: 'Settings' }
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
        <div className="logo-container">
          <Shield size={22} className="logo-icon" />
        </div>
        <h5>PackYatra</h5>
      </div>

      {/* Sidebar Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Menu</div>

        {/* 🔐 Role Based Menu */}
        {filteredNavItems.map(item => {
          const IconComponent = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isSubmenuOpen = expandedMenu === item.id;
          const isCurrentActive = currentPage === item.id || (hasSubmenu && item.submenu.some(sub => sub.id === currentPage));

          return (
            <div key={item.id} className="nav-item-wrapper">
              <div className="nav-item-container">
                <a
                  onClick={() => {
                    if (hasSubmenu) {
                      toggleSubmenu(item.id);
                    } else {
                      handleMenuClick(item.id);
                    }
                  }}
                  className={`nav-item ${isCurrentActive ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <IconComponent size={18} className="nav-icon-lucide" />
                  <span className="nav-text">{item.text}</span>
                  
                  {/* Dropdown arrow for items with submenu */}
                  {hasSubmenu && (
                    <ChevronDown
                      size={14}
                      className={`submenu-icon ${isSubmenuOpen ? 'expanded' : ''}`}
                    />
                  )}
                </a>
              </div>

              {/* Submenu Items */}
              {hasSubmenu && (
                <div className={`submenu ${isSubmenuOpen ? 'show' : ''}`}>
                  {item.submenu.map(subitem => {
                    const SubIconComponent = subitem.icon;
                    const isSubActive = currentPage === subitem.id;
                    return (
                      <a
                        key={subitem.id}
                        onClick={() => handleMenuClick(subitem.id)}
                        className={`submenu-item ${isSubActive ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <SubIconComponent size={14} className="nav-icon-lucide sub-icon" />
                        <span className="nav-text">{subitem.text}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="footer-profile-wrapper">
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              {initials}
            </div>
          </div>
          <div className="profile-details">
            <p className="profile-name">
              {userData?.firstName} {userData?.lastName}
            </p>
            <p className="profile-role">
              {roleId === 1 ? 'Administrator' : 'Supervisor'}
            </p>
          </div>
          <button onClick={onLogout} className="logout-btn" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;