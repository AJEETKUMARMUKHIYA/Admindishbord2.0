import React, { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import axiosClient from '../../AxiosClient';
import { showToast } from '../../utils/toast';
import './Vehicle.css';
import { 
  Truck, 
  Phone, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  RefreshCw, 
  Download, 
  Inbox, 
  Plus, 
  Check, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  User,
  Layers,
  Sparkles
} from 'lucide-react';

const ROWS_PER_PAGE = 8;

const Vehicle = ({ onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleList, setVehicleList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Form State for new vehicle
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '',
    vehicleType: '',
    driverName: '',
    driverPhone: '',
    capacity: ''
  });

  // Modal State for editing vehicle
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Robust Toast Helper
  const triggerToast = (message, type = 'success') => {
    if (showToast && typeof showToast[type] === 'function') {
      showToast[type](message);
    } else if (typeof showToast === 'function') {
      showToast(message, type);
    } else {
      console.log(`[Toast] ${type}: ${message}`);
    }
  };

  // Fetch Vehicles
  const getAllVehicles = async () => {
    try {
      const res = await axiosClient.get('/vehicle/all');
      const data = res.data?.data || res.data || [];
      setVehicleList(data);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
      triggerToast('Could not load vehicles', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllVehicles();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e, isEditing = false) => {
    const { id, value } = e.target;
    if (isEditing) {
      setEditingVehicle((prev) => ({ ...prev, [id]: value }));
    } else {
      setNewVehicle((prev) => ({ ...prev, [id]: value }));
    }
  };

  // Re-sync / Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await axiosClient.get('/vehicle/all');
      const data = res.data?.data || res.data || [];
      setVehicleList(data);
      onRefresh?.();
      triggerToast('Fleet records successfully synchronized', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Synchronization failed', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add Vehicle
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.vehicleNumber.trim()) {
      triggerToast('Vehicle number is required', 'warning');
      return;
    }
    try {
      await axiosClient.post('/vehicle', newVehicle);
      triggerToast(`Vehicle ${newVehicle.vehicleNumber} registered successfully`, 'success');
      setNewVehicle({
        vehicleNumber: '',
        vehicleType: '',
        driverName: '',
        driverPhone: '',
        capacity: ''
      });
      setIsAddFormOpen(false);
      await getAllVehicles();
    } catch (err) {
      triggerToast('Failed to register new vehicle', 'error');
      console.error(err);
    }
  };

  // Update Vehicle
  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    if (!editingVehicle) return;
    if (!editingVehicle.vehicleNumber.trim()) {
      triggerToast('Vehicle number is required', 'warning');
      return;
    }
    try {
      await axiosClient.put(`/vehicle/${editingVehicle.id}`, editingVehicle);
      triggerToast(`Vehicle ${editingVehicle.vehicleNumber} updated successfully`, 'success');
      setEditingVehicle(null);
      await getAllVehicles();
    } catch (err) {
      triggerToast('Failed to update vehicle record', 'error');
      console.error(err);
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (id, number) => {
    if (!window.confirm(`Are you sure you want to remove vehicle ${number} from the active fleet? This action is irreversible.`)) {
      return;
    }
    try {
      await axiosClient.delete(`/vehicle/${id}`);
      triggerToast(`Vehicle ${number} successfully removed`, 'success');
      await getAllVehicles();
    } catch (err) {
      triggerToast('Failed to remove vehicle from database', 'error');
      console.error(err);
    }
  };

  // Handle Search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset pagination
  };

  // Filtered list
  const filteredVehicles = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return vehicleList;
    return vehicleList.filter((v) => 
      v.vehicleNumber?.toLowerCase().includes(query) ||
      v.driverName?.toLowerCase().includes(query) ||
      v.vehicleType?.toLowerCase().includes(query)
    );
  }, [vehicleList, searchTerm]);

  // Compute operational overview metrics
  const metrics = useMemo(() => {
    const total = vehicleList.length;
    const available = vehicleList.filter(v => v.status === 'Available').length;
    const busy = vehicleList.filter(v => v.status === 'Busy').length;
    const utilizationRate = total > 0 ? Math.round((busy / total) * 100) : 0;

    return {
      total,
      available,
      busy,
      utilizationRate
    };
  }, [vehicleList]);

  // Export excel report
  const handleExport = () => {
    if (vehicleList.length === 0) {
      triggerToast('No fleet data to export', 'warning');
      return;
    }
    const data = vehicleList.map((v) => ({
      'Vehicle ID': v.id,
      'Vehicle Number': v.vehicleNumber,
      'Vehicle Type': v.vehicleType,
      'Driver Name': v.driverName,
      'Driver Phone': v.driverPhone,
      'Capacity (Payload)': v.capacity,
      'Status': v.status || 'Available'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fleet Directory');
    XLSX.writeFile(wb, 'Corporate_Fleet_Report.xlsx');
    triggerToast('Fleet Operational Report downloaded successfully', 'success');
  };

  // Pagination bounds
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredVehicles.slice(start, start + ROWS_PER_PAGE);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / ROWS_PER_PAGE);

  return (
    <div className="vm-page">
      {/* Page Header */}
      <div className="vm-header">
        <div className="vm-header-info">
          <div className="vm-eyebrow">
            <ShieldAlert size={12} /> Fleet Logistical Command
          </div>
          <h1 className="vm-title">Vehicle Management</h1>
          <p className="vm-subtitle">
            Manage active transport fleet registrations, track vehicle utilization, and assign drivers.
          </p>
        </div>
        <div className="vm-actions">
          <button className="vm-btn vm-btn--ghost" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw size={14} className={isRefreshing ? 'vm-spin' : ''} />
            <span>{isRefreshing ? 'Syncing…' : 'Sync Records'}</span>
          </button>
          <button className="vm-btn vm-btn--solid" onClick={handleExport}>
            <Download size={14} />
            <span>Export Fleet</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metrics Grid */}
      <div className="vm-metrics-grid">
        <div className="vm-metric-card">
          <div className="vm-metric-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Truck size={20} />
          </div>
          <div className="vm-metric-info">
            <span className="vm-metric-label">Active Fleet</span>
            <span className="vm-metric-val">{metrics.total}</span>
          </div>
        </div>

        <div className="vm-metric-card">
          <div className="vm-metric-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div className="vm-metric-info">
            <span className="vm-metric-label">Available Vehicles</span>
            <span className="vm-metric-val">{metrics.available}</span>
          </div>
        </div>

        <div className="vm-metric-card">
          <div className="vm-metric-icon-wrapper" style={{ backgroundColor: '#fefbeb', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="vm-metric-info">
            <span className="vm-metric-label">On Duty (Busy)</span>
            <span className="vm-metric-val">{metrics.busy}</span>
          </div>
        </div>

        <div className="vm-metric-card">
          <div className="vm-metric-icon-wrapper" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
            <TrendingUp size={20} />
          </div>
          <div className="vm-metric-info">
            <span className="vm-metric-label">Utilization Rate</span>
            <span className="vm-metric-val">{metrics.utilizationRate}%</span>
          </div>
        </div>
      </div>

      {/* Primary Card Frame */}
      <div className="vm-card-frame">
        {/* Controls and Search bar */}
        <div className="vm-control-strip">
          <div className="vm-search-box">
            <Search size={16} className="vm-search-icon" />
            <input
              type="text"
              className="vm-search-input"
              placeholder="Search by vehicle number, type, driver..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button className="vm-search-clear" onClick={() => handleSearchChange({ target: { value: '' } })}>
                <X size={15} />
              </button>
            )}
          </div>

          <button 
            className={`vm-btn-toggle-add ${isAddFormOpen ? 'active' : ''}`}
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          >
            {isAddFormOpen ? <X size={14} /> : <Plus size={14} />}
            <span>{isAddFormOpen ? 'Close Registration Form' : 'Register New Vehicle'}</span>
          </button>
        </div>

        {/* Collapsible Registration Form Panel */}
        {isAddFormOpen && (
          <div className="vm-registration-panel">
            <div className="vm-registration-header">
              <Sparkles size={14} style={{ color: '#2563eb' }} />
              <h4>New Vehicle Registration Entry</h4>
            </div>
            <form onSubmit={handleAddVehicle}>
              <div className="vm-form-grid">
                <div className="vm-field">
                  <label htmlFor="vehicleNumber">Vehicle Number</label>
                  <input
                    id="vehicleNumber"
                    type="text"
                    required
                    placeholder="e.g. BR-01-AB-1234"
                    value={newVehicle.vehicleNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="vm-field">
                  <label htmlFor="vehicleType">Vehicle Type</label>
                  <input
                    id="vehicleType"
                    type="text"
                    placeholder="e.g. Container Truck, Box Van"
                    value={newVehicle.vehicleType}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="vm-field">
                  <label htmlFor="driverName">Driver Name</label>
                  <input
                    id="driverName"
                    type="text"
                    placeholder="Full name"
                    value={newVehicle.driverName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="vm-field">
                  <label htmlFor="driverPhone">Driver Phone</label>
                  <input
                    id="driverPhone"
                    type="text"
                    placeholder="10-digit mobile"
                    value={newVehicle.driverPhone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="vm-field">
                  <label htmlFor="capacity">Payload Capacity</label>
                  <input
                    id="capacity"
                    type="text"
                    placeholder="e.g. 1500 kg, 3 Tons"
                    value={newVehicle.capacity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="vm-registration-footer">
                <button 
                  type="button" 
                  className="vm-btn-action-cancel"
                  onClick={() => setIsAddFormOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="vm-btn-action-submit">
                  Add Vehicle to Fleet
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Fleet Directory Table */}
        <div className="vm-table-container">
          {isLoading ? (
            <div className="vm-state-row">
              <RefreshCw size={18} className="vm-spin" style={{ color: '#2563eb' }} />
              <span>Querying fleet logistics database...</span>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="vm-empty-state">
              <Inbox size={42} style={{ color: '#cbd5e1', marginBottom: 12 }} />
              <h4>No matching fleet records found</h4>
              <p>
                {searchTerm 
                  ? `There are no vehicles matching the search term "${searchTerm}".`
                  : 'The operational database has no vehicles currently registered.'}
              </p>
              {!searchTerm && (
                <button 
                  className="vm-btn-action-submit" 
                  style={{ marginTop: 14 }}
                  onClick={() => setIsAddFormOpen(true)}
                >
                  <Plus size={14} /> Register First Vehicle
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="vm-table">
                <thead>
                  <tr>
                    <th>Vehicle Details</th>
                    <th>Driver Assigned</th>
                    <th>Payload Capacity</th>
                    <th>Duty Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVehicles.map((v) => {
                    const isBusy = v.status === 'Busy';
                    return (
                      <tr key={v.id}>
                        <td>
                          <div className="vm-vehicle-cell">
                            <div className="vm-vehicle-icon">
                              <Truck size={15} />
                            </div>
                            <div className="vm-vehicle-meta">
                              <span className="vm-vehicle-number">{v.vehicleNumber}</span>
                              <span className="vm-vehicle-type">{v.vehicleType || 'Standard Vehicle'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="vm-driver-info">
                            <span className="vm-driver-name">{v.driverName || 'No Driver Assigned'}</span>
                            {v.driverPhone && (
                              <a href={`tel:${v.driverPhone}`} className="vm-driver-phone-link">
                                <Phone size={11} />
                                <span>{v.driverPhone}</span>
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="vm-capacity-badge">
                            <Layers size={11} style={{ marginRight: 4, color: '#64748b' }} />
                            {v.capacity || 'Unspecified'}
                          </span>
                        </td>
                        <td>
                          <span className={`vm-status-pill ${isBusy ? 'busy' : 'available'}`}>
                            {v.status || 'Available'}
                          </span>
                        </td>
                        <td>
                          <div className="vm-row-actions">
                            <button
                              type="button"
                              className="vm-btn-icon-round"
                              title="Edit fleet record"
                              onClick={() => setEditingVehicle({ ...v })}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="vm-btn-icon-round danger"
                              title="Decommission vehicle"
                              onClick={() => handleDeleteVehicle(v.id, v.vehicleNumber)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Dynamic Table Pagination Footer */}
              {totalPages > 1 && (
                <div className="vm-pagination-bar">
                  <div className="vm-pagination-info">
                    Showing {(currentPage - 1) * ROWS_PER_PAGE + 1} to {Math.min(currentPage * ROWS_PER_PAGE, filteredVehicles.length)} of {filteredVehicles.length} vehicles
                  </div>
                  <ul className="vm-pager">
                    <li>
                      <button
                        type="button"
                        className={`vm-pager-btn ${currentPage === 1 ? 'disabled' : ''}`}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        <ChevronLeft size={14} />
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          className={`vm-pager-btn ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        className={`vm-pager-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================= EDIT VEHICLE DETAIL MODAL ================= */}
      {editingVehicle && (
        <div className="vm-modal-overlay" onClick={() => setEditingVehicle(null)}>
          <div className="vm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vm-modal-header">
              <h3 className="vm-modal-title">Edit Fleet Record</h3>
              <button 
                type="button" 
                className="vm-btn-modal-close" 
                onClick={() => setEditingVehicle(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateVehicle}>
              <div className="vm-modal-body">
                <div className="vm-modal-meta-bar">
                  <span className="vm-modal-eyebrow">Vehicle Identifier</span>
                  <span className="vm-modal-vehicle-tag">{editingVehicle.vehicleNumber}</span>
                </div>

                <div className="vm-modal-grid">
                  <div className="vm-field">
                    <label htmlFor="vehicleType">Vehicle Type</label>
                    <input
                      id="vehicleType"
                      type="text"
                      value={editingVehicle.vehicleType || ''}
                      onChange={(e) => handleInputChange(e, true)}
                    />
                  </div>

                  <div className="vm-field">
                    <label htmlFor="driverName">Driver Name</label>
                    <input
                      id="driverName"
                      type="text"
                      value={editingVehicle.driverName || ''}
                      onChange={(e) => handleInputChange(e, true)}
                    />
                  </div>

                  <div className="vm-field">
                    <label htmlFor="driverPhone">Driver Phone</label>
                    <input
                      id="driverPhone"
                      type="text"
                      value={editingVehicle.driverPhone || ''}
                      onChange={(e) => handleInputChange(e, true)}
                    />
                  </div>

                  <div className="vm-field">
                    <label htmlFor="capacity">Payload Capacity</label>
                    <input
                      id="capacity"
                      type="text"
                      value={editingVehicle.capacity || ''}
                      onChange={(e) => handleInputChange(e, true)}
                    />
                  </div>

                  <div className="vm-field">
                    <label htmlFor="status">Operational Status</label>
                    <select
                      id="status"
                      className="vm-modal-select"
                      value={editingVehicle.status || 'Available'}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="Available">Available (Standby / Idle)</option>
                      <option value="Busy">Busy (En Route / In Transit)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="vm-modal-footer">
                <button 
                  type="button" 
                  className="vm-btn-action-cancel" 
                  onClick={() => setEditingVehicle(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="vm-btn-action-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicle;
