import { useState } from 'react';
import { 
  User, 
  Building2, 
  BellRing, 
  Cpu, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Trash2,
  Lock,
  Globe,
  Database,
  Palette
} from 'lucide-react';
import { showToast } from './ToastNotification';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('app-theme') || 'vibrant-ocean');

  // Load user details from LocalStorage (with sensible fallbacks)
  const [profile, setProfile] = useState({
    firstName: localStorage.getItem('firstName') || 'User',
    lastName: localStorage.getItem('lastName') || 'Admin',
    email: localStorage.getItem('email') || 'operations@packyatra.com',
    phone: localStorage.getItem('mobile') || '+91 98765 43210',
    role: localStorage.getItem('roleId') === '1' ? 'Administrator' : 'Supervisor'
  });

  const [agency, setAgency] = useState({
    name: 'PackYatra Operations Ltd',
    taxRate: '18',
    currency: 'INR (₹)',
    address: 'Sector 62, Noida, Uttar Pradesh, 201301',
    billingEmail: 'accounts@packyatra.com'
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailSupervisors: false,
    weeklyDigest: true,
    systemAlerts: true
  });

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAgencyChange = (e) => {
    setAgency({ ...agency, [e.target.name]: e.target.value });
  };

  const handleToggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      
      // Save profile changes back to local storage
      localStorage.setItem('firstName', profile.firstName);
      localStorage.setItem('lastName', profile.lastName);
      localStorage.setItem('email', profile.email);
      
      showToast.success('Settings saved successfully!');
    }, 800);
  };

  const handleClearCache = () => {
    showToast.info('Clearing application cache...');
    setTimeout(() => {
      showToast.success('Application cache cleared!');
    }, 1000);
  };

  return (
    <div id="settingsPage" className="settings-panel">
      <style>{`
        #settingsPage {
          font-family: 'Inter', sans-serif;
          color: #0f172a;
          max-width: 1100px;
          margin: 0 auto;
          padding: 10px 0 40px;
        }

        /* Header Style */
        .settings-header {
          margin-bottom: 24px;
        }
        .settings-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #2563eb;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .settings-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin: 0;
        }
        .settings-subtitle {
          font-size: 13.5px;
          color: #64748b;
          margin-top: 2px;
          margin-bottom: 0;
        }

        /* Grid Layout */
        .settings-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
          margin-top: 28px;
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        /* Navigation Menu */
        .settings-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        @media (max-width: 768px) {
          .settings-nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
        }

        .settings-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #64748b;
          font-size: 13.5px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .settings-nav-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .settings-nav-btn.active {
          background: #eff6ff;
          color: #2563eb;
          border-left: 3px solid #06b6d4;
          border-top-left-radius: 0px;
          border-bottom-left-radius: 0px;
        }

        /* Content Card */
        .settings-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .settings-card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .settings-card-title {
          font-size: 15px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }

        .settings-card-body {
          padding: 24px;
        }

        /* Form Layouts */
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        @media (max-width: 576px) {
          .form-row-2 {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        .settings-field {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-field label {
          font-size: 12.5px;
          font-weight: 600;
          color: #475569;
        }

        .settings-input {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 13.5px;
          font-family: inherit;
          color: #0f172a;
          background-color: #ffffff;
          transition: all 0.15s ease;
        }

        .settings-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          outline: none;
        }

        .settings-input:disabled {
          background-color: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }

        /* Toggle switches */
        .toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .toggle-item:last-child {
          border-bottom: none;
        }

        .toggle-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .toggle-title {
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
        }

        .toggle-desc {
          font-size: 11.5px;
          color: #64748b;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: .3s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #2563eb;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #2563eb;
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }

        /* Footer buttons */
        .settings-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-settings {
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .btn-settings-primary {
          background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
          color: #ffffff;
          border: none;
        }

        .btn-settings-primary:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .btn-settings-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .btn-settings-outline {
          background: #ffffff;
          border-color: #cbd5e1;
          color: #475569;
        }

        .btn-settings-outline:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        /* Status & Diagnostics grid */
        .diag-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .diag-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px;
          background: #f8fafc;
        }

        .diag-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .diag-value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Theme Grid */
        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 10px;
        }

        .theme-option-card {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        .theme-option-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .theme-option-card.active {
          border-color: var(--primary-color);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .theme-preview-box {
          height: 100px;
          border-radius: 8px;
          display: flex;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .theme-preview-sidebar {
          width: 30%;
          height: 100%;
        }

        .theme-preview-content {
          width: 70%;
          height: 100%;
          background: #f8fafc;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .theme-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .theme-preview-logo {
          width: 14px;
          height: 14px;
          border-radius: 3px;
        }

        .theme-preview-line {
          height: 6px;
          border-radius: 3px;
          background: #e2e8f0;
          margin-bottom: 4px;
        }

        .theme-meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .theme-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .theme-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .theme-desc {
          font-size: 11.5px;
          color: #64748b;
          line-height: 1.4;
        }

        .theme-badge-selected {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--primary-color);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* Title block */}
      <div className="settings-header">
        <div className="settings-eyebrow">CONFIGURATION ENGINE</div>
        <h1 className="settings-title">System Settings</h1>
        <p className="settings-subtitle">Manage operator profiles, system parameters, rules, and operational configurations.</p>
      </div>

      {/* Main Grid */}
      <div className="settings-grid">
        {/* Left Nav */}
        <div className="settings-nav">
          <button 
            className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            My Profile
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            <Palette size={16} />
            Theme & Color Mode
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'agency' ? 'active' : ''}`}
            onClick={() => setActiveTab('agency')}
          >
            <Building2 size={16} />
            Agency Settings
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <BellRing size={16} />
            Notification Rules
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnostics')}
          >
            <Cpu size={16} />
            System Status
          </button>
        </div>

        {/* Right content box */}
        <div className="settings-card">
          {activeTab === 'theme' && (
            <>
              <div className="settings-card-header">
                <h3 className="settings-card-title">Application Theme & Color Mode</h3>
              </div>
              <div className="settings-card-body">
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                  Choose your preferred color mode for the dashboard and sidebar to match your workspace ambiance. Changes are applied instantly and saved to your profile.
                </p>

                <div className="theme-grid">
                  {[
                    {
                      id: 'vibrant-ocean',
                      name: 'Vibrant Ocean',
                      desc: 'Energetic blue-to-cyan gradient reflecting professional relocation and move velocity.',
                      accent: '#0ea5e9',
                      sidebarBg: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 50%, #06b6d4 100%)',
                    },
                    {
                      id: 'classic-slate',
                      name: 'Classic Slate',
                      desc: 'Sophisticated dark slate and navy tone for a premium, formal business aesthetic.',
                      accent: '#1e293b',
                      sidebarBg: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                    },
                    {
                      id: 'eco-green',
                      name: 'Emerald Eco-Move',
                      desc: 'Organic green hues emphasizing safety, reliability, and eco-friendly transits.',
                      accent: '#059669',
                      sidebarBg: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%)',
                    },
                    {
                      id: 'sunset-amber',
                      name: 'Sunset Amber',
                      desc: 'Warm, high-visibility logistics gradient representing swift dispatch and premium care.',
                      accent: '#d97706',
                      sidebarBg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #f97316 100%)',
                    },
                    {
                      id: 'obsidian-dark',
                      name: 'Obsidian Dark',
                      desc: 'High-contrast dark operator interface designed to reduce eye strain during night duty.',
                      accent: '#8b5cf6',
                      sidebarBg: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                    }
                  ].map((theme) => (
                    <div 
                      key={theme.id}
                      className={`theme-option-card ${currentTheme === theme.id ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentTheme(theme.id);
                        localStorage.setItem('app-theme', theme.id);
                        document.body.setAttribute('data-theme', theme.id);
                        showToast.success(`${theme.name} theme applied!`);
                      }}
                    >
                      <div className="theme-preview-box">
                        <div 
                          className="theme-preview-sidebar" 
                          style={{ background: theme.sidebarBg }}
                        />
                        <div className="theme-preview-content">
                          <div className="theme-preview-header">
                            <div className="theme-preview-logo" style={{ background: theme.accent }} />
                            <div style={{ display: 'flex', gap: '3px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.accent }} />
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
                            </div>
                          </div>
                          <div>
                            <div className="theme-preview-line" style={{ width: '80%' }} />
                            <div className="theme-preview-line" style={{ width: '50%' }} />
                          </div>
                        </div>
                      </div>

                      <div className="theme-meta">
                        <div className="theme-info">
                          <span className="theme-name">{theme.name}</span>
                          <span className="theme-desc">{theme.desc}</span>
                        </div>
                        {currentTheme === theme.id && (
                          <div className="theme-badge-selected">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <>
              <div className="settings-card-header">
                <h3 className="settings-card-title">Operator Profile Information</h3>
                <span style={{ fontSize: 11.5, fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 4 }}>
                  {profile.role}
                </span>
              </div>
              <div className="settings-card-body">
                <div className="form-row-2">
                  <div className="settings-field">
                    <label htmlFor="firstName">First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName" 
                      value={profile.firstName} 
                      onChange={handleProfileChange}
                      className="settings-input" 
                    />
                  </div>
                  <div className="settings-field">
                    <label htmlFor="lastName">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName" 
                      value={profile.lastName} 
                      onChange={handleProfileChange}
                      className="settings-input" 
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="settings-field">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={profile.email} 
                      onChange={handleProfileChange}
                      className="settings-input" 
                    />
                  </div>
                  <div className="settings-field">
                    <label htmlFor="phone">Mobile Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={profile.phone} 
                      onChange={handleProfileChange}
                      className="settings-input" 
                    />
                  </div>
                </div>

                <div className="settings-field" style={{ maxWidth: '300px' }}>
                  <label htmlFor="userRole">Assigned Access Role</label>
                  <input 
                    type="text" 
                    id="userRole" 
                    value={profile.role} 
                    disabled 
                    className="settings-input" 
                  />
                </div>
              </div>
              <div className="settings-footer">
                <button 
                  className="btn-settings btn-settings-primary" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <RefreshCw size={14} className="vm-spin" /> : <Check size={14} />}
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'agency' && (
            <>
              <div className="settings-card-header">
                <h3 className="settings-card-title">Corporate & Operational Agency Details</h3>
              </div>
              <div className="settings-card-body">
                <div className="settings-field">
                  <label htmlFor="agencyName">Agency Commercial Name</label>
                  <input 
                    type="text" 
                    id="agencyName" 
                    name="name" 
                    value={agency.name} 
                    onChange={handleAgencyChange}
                    className="settings-input" 
                  />
                </div>

                <div className="form-row-2">
                  <div className="settings-field">
                    <label htmlFor="taxRate">Operational GST / Service Tax (%)</label>
                    <input 
                      type="number" 
                      id="taxRate" 
                      name="taxRate" 
                      value={agency.taxRate} 
                      onChange={handleAgencyChange}
                      className="settings-input" 
                    />
                  </div>
                  <div className="settings-field">
                    <label htmlFor="currency">Local Standard Currency</label>
                    <select 
                      id="currency" 
                      name="currency" 
                      value={agency.currency} 
                      onChange={handleAgencyChange}
                      className="settings-input"
                    >
                      <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                      <option value="USD ($)">USD ($) - United States Dollar</option>
                      <option value="EUR (€)">EUR (€) - Euro</option>
                    </select>
                  </div>
                </div>

                <div className="settings-field">
                  <label htmlFor="billingEmail">Central Accounts Email</label>
                  <input 
                    type="email" 
                    id="billingEmail" 
                    name="billingEmail" 
                    value={agency.billingEmail} 
                    onChange={handleAgencyChange}
                    className="settings-input" 
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="address">Registered Office Address</label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address" 
                    value={agency.address} 
                    onChange={handleAgencyChange}
                    className="settings-input" 
                  />
                </div>
              </div>
              <div className="settings-footer">
                <button 
                  className="btn-settings btn-settings-primary" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <RefreshCw size={14} className="vm-spin" /> : <Check size={14} />}
                  {saving ? 'Saving...' : 'Save Configurations'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <div className="settings-card-header">
                <h3 className="settings-card-title">Realtime Rules & Dispatch Notifications</h3>
              </div>
              <div className="settings-card-body" style={{ padding: '8px 24px' }}>
                <div className="toggle-item">
                  <div className="toggle-details">
                    <span className="toggle-title">Immediate Booking Alerts</span>
                    <span className="toggle-desc">Dispatch a mail to administrators when a customer logs an inquiry or booking.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.emailBookings} 
                      onChange={() => handleToggleNotification('emailBookings')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-details">
                    <span className="toggle-title">Field Officer Status Changes</span>
                    <span className="toggle-desc">Receive notifications when a supervisor marks themselves offline or off-duty.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.emailSupervisors} 
                      onChange={() => handleToggleNotification('emailSupervisors')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-details">
                    <span className="toggle-title">Weekly Business Digest</span>
                    <span className="toggle-desc">Generate and email an aggregate PDF report of completed moves and driver ratings.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.weeklyDigest} 
                      onChange={() => handleToggleNotification('weeklyDigest')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-details">
                    <span className="toggle-title">System & Security Logs</span>
                    <span className="toggle-desc">Notify on suspicious log-in activity or changes in operator security roles.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.systemAlerts} 
                      onChange={() => handleToggleNotification('systemAlerts')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              <div className="settings-footer">
                <button 
                  className="btn-settings btn-settings-primary" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Check size={14} />
                  Save Preferences
                </button>
              </div>
            </>
          )}

          {activeTab === 'diagnostics' && (
            <>
              <div className="settings-card-header">
                <h3 className="settings-card-title">System Status & Environment Diagnostics</h3>
              </div>
              <div className="settings-card-body">
                <div className="diag-grid">
                  <div className="diag-card">
                    <div className="diag-label">Core Database Ingress</div>
                    <div className="diag-value">
                      <Database size={15} style={{ color: '#10b981' }} />
                      <span style={{ color: '#10b981' }}>Connected</span>
                    </div>
                  </div>
                  <div className="diag-card">
                    <div className="diag-label">Operations SSL Tunnel</div>
                    <div className="diag-value">
                      <ShieldCheck size={15} style={{ color: '#10b981' }} />
                      <span style={{ color: '#10b981' }}>Secure (AES-256)</span>
                    </div>
                  </div>
                  <div className="diag-card">
                    <div className="diag-label">Gateway Latency</div>
                    <div className="diag-value" style={{ color: '#2563eb' }}>
                      <Globe size={15} />
                      34 ms
                    </div>
                  </div>
                  <div className="diag-card">
                    <div className="diag-label">Server Version</div>
                    <div className="diag-value">
                      v2.4.2-prod
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Local Workspace Management</h4>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                      If pages display outdated booking details or manifest charts are not loading, perform a soft workspace cache reset.
                    </p>
                  </div>
                  <div>
                    <button 
                      className="btn-settings btn-settings-outline" 
                      style={{ color: '#ef4444' }}
                      onClick={handleClearCache}
                    >
                      <Trash2 size={13} />
                      Reset Local Workspace Cache
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
