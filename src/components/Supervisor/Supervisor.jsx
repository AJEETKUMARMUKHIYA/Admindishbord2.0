import React, { useState, useMemo } from 'react';
import AddSupervisor from './AddSupervisor';
import SupervisorList from './SupervisorList';
import axiosClient from '../../AxiosClient';
import { showToast } from '../ToastNotification';
import './Supervisor.css';

import { 
  RefreshCw, 
  UserPlus, 
  X, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  ShieldAlert,
  Inbox
} from 'lucide-react';

const Supervisor = ({ supervisors = [], onRefresh }) => {
  const [newSupervisor, setNewSupervisor] = useState({
    userId: null,
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: ''
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search filter
  const filteredSupervisors = useMemo(() => {
    return supervisors.filter((s) => {
      const query = searchQuery.toLowerCase();
      const first = s.firstName?.toLowerCase() || '';
      const last = s.lastName?.toLowerCase() || '';
      const email = s.email?.toLowerCase() || '';
      const mobile = s.mobile || '';
      const id = String(s.userId || '');
      return first.includes(query) || last.includes(query) || email.includes(query) || mobile.includes(query) || id.includes(query);
    });
  }, [supervisors, searchQuery]);

  // Purely presentational stats
  const counts = useMemo(() => {
    return {
      total: supervisors.length,
      active: supervisors.filter((s) => s.active).length,
      inactive: supervisors.filter((s) => !s.active).length,
    };
  }, [supervisors]);

  // Open Add dialog
  const handleOpenAdd = () => {
    setNewSupervisor({
      userId: null,
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      password: ''
    });
    setIsEditMode(false);
    setPanelOpen(true);
  };

  // Open Edit dialog
  const handleOpenEdit = (supervisor) => {
    setNewSupervisor({
      userId: supervisor.userId,
      firstName: supervisor.firstName || '',
      lastName: supervisor.lastName || '',
      mobile: supervisor.mobile || '',
      email: supervisor.email || '',
      password: '' // Don't pre-populate passwords
    });
    setIsEditMode(true);
    setPanelOpen(true);
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewSupervisor(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Save (Create or Update)
  const handleSaveSupervisor = async () => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        // Update supervisor
        const payload = {
          userId: newSupervisor.userId,
          firstName: newSupervisor.firstName,
          lastName: newSupervisor.lastName,
          email: newSupervisor.email,
          mobile: newSupervisor.mobile,
          defaultAccountId: 1,
          roleId: 2, // Role 2 is Supervisor
          active: true // Keep active by default on edit
        };
        await axiosClient.put(`/AdminUser/UpdateUser/${newSupervisor.userId}`, payload);
        showToast.success('Supervisor details updated successfully!');
      } else {
        // Create supervisor
        const payload = {
          firstName: newSupervisor.firstName,
          lastName: newSupervisor.lastName,
          email: newSupervisor.email,
          mobile: newSupervisor.mobile,
          password: newSupervisor.password || '123456',
          defaultAccountId: 1,
          roleId: 2, // Role 2 is Supervisor
          active: true
        };
        await axiosClient.post('/AdminUser/CreateUser', payload);
        showToast.success('New supervisor created successfully!');
      }
      setPanelOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      showToast.error('Operation failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status (Activate / Deactivate)
  const handleToggleSupervisorStatus = async (supervisor) => {
    try {
      const payload = {
        userId: supervisor.userId,
        firstName: supervisor.firstName,
        lastName: supervisor.lastName,
        email: supervisor.email,
        mobile: supervisor.mobile,
        defaultAccountId: supervisor.defaultAccountId || 1,
        roleId: 2,
        active: !supervisor.active
      };
      await axiosClient.put(`/AdminUser/UpdateUser/${supervisor.userId}`, payload);
      showToast.success(`Supervisor ${!supervisor.active ? 'activated' : 'deactivated'} successfully!`);
      if (onRefresh) onRefresh();
    } catch (error) {
      showToast.error('Failed to change status: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete supervisor
  const handleDeleteSupervisor = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this supervisor?')) {
      try {
        await axiosClient.delete(`/AdminUser/DeleteUser/${userId}`);
        showToast.success('Supervisor deleted successfully!');
        if (onRefresh) onRefresh();
      } catch (error) {
        showToast.error('Failed to delete supervisor: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="sp-page">
      {/* Header section */}
      <div className="sp-header">
        <div>
          <div className="sp-eyebrow">
            <ShieldAlert size={12} /> Operations · Command Center
          </div>
          <h1 className="sp-title">Field Supervisors</h1>
          <p className="sp-subtitle">Manage registered supervisors, configure field operations credentials, and oversee on-site dispatch staff.</p>
        </div>
        <div className="sp-actions">
          <button
            type="button"
            className="sp-btn sp-btn--ghost"
            onClick={onRefresh}
            disabled={submitting}
          >
            <RefreshCw size={14} className={submitting ? 'sp-spin' : ''} />
            <span>Sync Directory</span>
          </button>
          <button
            type="button"
            className="sp-btn sp-btn--solid"
            onClick={handleOpenAdd}
          >
            <UserPlus size={14} />
            <span>Add Supervisor</span>
          </button>
        </div>
      </div>

      {/* Bento-Style Stats Cards Grid */}
      <div className="sp-stats-grid">
        <div className="sp-stat-card">
          <span className="sp-stat-card__tab" style={{ backgroundColor: 'var(--sp-primary)' }} />
          <div className="sp-stat-card__info">
            <span className="sp-stat-card__label">Total Supervisors</span>
            <div className="sp-stat-card__value">{counts.total}</div>
          </div>
          <div className="sp-stat-card__icon" style={{ backgroundColor: 'var(--sp-primary-light)', color: 'var(--sp-primary)' }}>
            <Users size={20} />
          </div>
        </div>

        <div className="sp-stat-card">
          <span className="sp-stat-card__tab" style={{ backgroundColor: 'var(--sp-green)' }} />
          <div className="sp-stat-card__info">
            <span className="sp-stat-card__label">Active Field Duty</span>
            <div className="sp-stat-card__value">{counts.active}</div>
          </div>
          <div className="sp-stat-card__icon sp-pulse" style={{ backgroundColor: 'var(--sp-green-light)', color: 'var(--sp-green)' }}>
            <UserCheck size={20} />
          </div>
        </div>

        <div className="sp-stat-card">
          <span className="sp-stat-card__tab" style={{ backgroundColor: 'var(--sp-text-mute)' }} />
          <div className="sp-stat-card__info">
            <span className="sp-stat-card__label">Standby / Standdown</span>
            <div className="sp-stat-card__value">{counts.inactive}</div>
          </div>
          <div className="sp-stat-card__icon" style={{ backgroundColor: '#f1f5f9', color: 'var(--sp-text-mute)' }}>
            <UserX size={20} />
          </div>
        </div>
      </div>

      {/* Primary Data Binding Table Frame */}
      <div className="sp-card-frame">
        {/* Search & Control Strip */}
        <div className="sp-control-strip">
          <div className="sp-search-box">
            <Search size={14} className="sp-search-icon" />
            <input
              type="text"
              placeholder="Search supervisors by name, email, ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sp-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="sp-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="sp-results-indicator">
            Showing <strong>{filteredSupervisors.length}</strong> of <strong>{supervisors.length}</strong> supervisors
          </div>
        </div>

        {/* Directory List Table */}
        <SupervisorList
          supervisors={filteredSupervisors}
          onToggleSupervisor={handleToggleSupervisorStatus}
          onDeleteSupervisor={handleDeleteSupervisor}
          onEditSupervisor={handleOpenEdit}
        />
      </div>

      {/* Elegant Add/Edit Supervisor Dialog Modal Overlay */}
      {panelOpen && (
        <div className="sp-dialog-overlay" onClick={() => setPanelOpen(false)}>
          <div className="sp-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="sp-dialog-header">
              <div className="sp-dialog-title-group">
                <span className="sp-dialog-eyebrow">
                  {isEditMode ? 'Modify Personnel' : 'New Personnel'}
                </span>
                <h3 className="sp-dialog-title">
                  {isEditMode ? 'Edit Supervisor Details' : 'Register New Supervisor'}
                </h3>
              </div>
              <button className="sp-dialog-close" onClick={() => setPanelOpen(false)} title="Close">
                <X size={16} />
              </button>
            </div>
            <div className="sp-dialog-body">
              <AddSupervisor
                supervisor={newSupervisor}
                onInputChange={handleInputChange}
                onAddSupervisor={handleSaveSupervisor}
                isEdit={isEditMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supervisor;
