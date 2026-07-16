import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import axiosClient from '../../AxiosClient';
import './Vehicle.css';

/* ---------- Inline icon set (no extra dependency) ---------- */
const Icon = {
  Refresh: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  ),
  Export: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 21h16" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  Truck: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M1 3h13v13H1z" />
      <path d="M14 8h4l4 4v4h-8z" />
      <circle cx="6" cy="18.5" r="1.8" />
      <circle cx="17.5" cy="18.5" r="1.8" />
    </svg>
  ),
  Phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.4 1.9.6 2.9.7a2 2 0 0 1 1.6 2z" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),
  Inbox: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.4 5h13.2L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
    </svg>
  ),
};

const Vehicle = ({ onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleList, setVehicleList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const getAllVehicles = async () => {
      try {
        const res = await axiosClient.get('/vehicle/all');
        const data = res.data?.data || res.data || [];
        setVehicleList(data);
      } catch (err) {
        console.error('Failed to fetch vehicles', err);
      } finally {
        setIsLoading(false);
      }
    };
    getAllVehicles();
  }, []);

  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '',
    vehicleType: '',
    driverName: '',
    driverPhone: '',
    capacity: ''
  });

  const [editingVehicle, setEditingVehicle] = useState(null);

  // ── Input Handler ─────────────────────────────
  const handleInputChange = (e, isEditing = false) => {
    const value = e.target.value;
    const field = e.target.id || e.target.name;

    if (isEditing) {
      setEditingVehicle((prev) => ({ ...prev, [field]: value }));
    } else {
      setNewVehicle((prev) => ({ ...prev, [field]: value }));
    }
  };

  // ── Refresh ─────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await axiosClient.get('/vehicle/all');
      setVehicleList(res.data?.data || res.data || []);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── Add Vehicle ─────────────────────────────
  const handleAddVehicle = async () => {
    try {
      await axiosClient.post('/vehicle', newVehicle);
      alert('Vehicle added successfully');
      setNewVehicle({
        vehicleNumber: '',
        vehicleType: '',
        driverName: '',
        driverPhone: '',
        capacity: ''
      });
      await handleRefresh();
    } catch (err) {
      alert('Failed to add vehicle');
      console.error(err);
    }
  };

  // ── Update Vehicle ─────────────────────────────
  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;
    try {
      await axiosClient.put(`/vehicle/${editingVehicle.id}`, editingVehicle);
      alert('Vehicle updated successfully');
      setEditingVehicle(null);
      await handleRefresh();
    } catch (err) {
      alert('Failed to update vehicle');
      console.error(err);
    }
  };

  // ── Delete Vehicle ─────────────────────────────
  const handleDeleteVehicle = async (id, number) => {
    if (!window.confirm(`Delete vehicle ${number}?`)) return;
    try {
      await axiosClient.delete(`/vehicle/${id}`);
      await handleRefresh();
    } catch (err) {
      alert('Failed to delete vehicle');
      console.error(err);
    }
  };

  // ── Filter ─────────────────────────────
  const filteredVehicles = vehicleList.filter((v) => {
    const search = searchTerm.toLowerCase();
    return (
      v.vehicleNumber?.toLowerCase().includes(search) ||
      v.driverName?.toLowerCase().includes(search) ||
      v.vehicleType?.toLowerCase().includes(search)
    );
  });

  // ── Export ─────────────────────────────
  // NOTE: previously exported the (often empty/stale) `vehicles` prop —
  // now exports the live, filtered-free vehicleList so the file always
  // matches what's on screen.
  const handleExport = () => {
    const data = vehicleList.map((v) => ({
      ID: v.id,
      'Vehicle Number': v.vehicleNumber,
      'Vehicle Type': v.vehicleType,
      Driver: v.driverName,
      Phone: v.driverPhone,
      Capacity: v.capacity,
      Status: v.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');
    XLSX.writeFile(wb, 'Vehicle_Report.xlsx');
  };

  const badgeClass = (status) => {
    if (status === 'Available') return 'vm-badge vm-badge--available';
    if (status === 'Busy') return 'vm-badge vm-badge--busy';
    return 'vm-badge vm-badge--other';
  };

  return (
    <div className="vm-page">

      {/* Header */}
      <div className="vm-header">
        <div>
          <p className="vm-eyebrow">Fleet Operations</p>
          <h2 className="vm-title">Vehicle Management</h2>
          <p className="vm-subtitle">Track fleet status, assign drivers, and keep records up to date.</p>
        </div>
        <div className="vm-actions">
          <button className="vm-btn vm-btn--ghost" onClick={handleRefresh} disabled={isRefreshing}>
            <Icon.Refresh className={isRefreshing ? 'vm-spin' : ''} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button className="vm-btn vm-btn--solid" onClick={handleExport}>
            <Icon.Export />
            Export
          </button>
        </div>
      </div>

      {/* Add Vehicle */}
      <div className="vm-card">
        <div className="vm-card__header">
          <h3 className="vm-card__title">Add vehicle</h3>
        </div>
        <div className="vm-card__body">
          <div className="vm-grid">
            <div className="vm-field">
              <label className="vm-label" htmlFor="vehicleNumber">Vehicle number</label>
              <input
                id="vehicleNumber"
                className="vm-input"
                placeholder="e.g. BR-01-AB-1234"
                value={newVehicle.vehicleNumber}
                onChange={(e) => handleInputChange(e)}
              />
            </div>

            <div className="vm-field">
              <label className="vm-label" htmlFor="vehicleType">Vehicle type</label>
              <input
                id="vehicleType"
                className="vm-input"
                placeholder="e.g. Truck, Van"
                value={newVehicle.vehicleType}
                onChange={(e) => handleInputChange(e)}
              />
            </div>

            <div className="vm-field">
              <label className="vm-label" htmlFor="driverName">Driver name</label>
              <input
                id="driverName"
                className="vm-input"
                placeholder="Full name"
                value={newVehicle.driverName}
                onChange={(e) => handleInputChange(e)}
              />
            </div>

            <div className="vm-field">
              <label className="vm-label" htmlFor="driverPhone">Driver phone</label>
              <input
                id="driverPhone"
                className="vm-input"
                placeholder="10-digit number"
                value={newVehicle.driverPhone}
                onChange={(e) => handleInputChange(e)}
              />
            </div>

            <div className="vm-field">
              <label className="vm-label" htmlFor="capacity">Capacity</label>
              <input
                id="capacity"
                className="vm-input"
                placeholder="e.g. 1000 kg"
                value={newVehicle.capacity}
                onChange={(e) => handleInputChange(e)}
              />
            </div>

            <div className="vm-form-actions">
              <button className="vm-btn vm-btn--primary" onClick={handleAddVehicle}>
                Add vehicle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Vehicle */}
      {editingVehicle && (
        <div className="vm-card vm-card--edit">
          <div className="vm-card__header">
            <h3 className="vm-card__title">
              Edit vehicle <span>· {editingVehicle.vehicleNumber}</span>
            </h3>
          </div>
          <div className="vm-card__body">
            <div className="vm-grid">
              <div className="vm-field">
                <label className="vm-label" htmlFor="vehicleType">Vehicle type</label>
                <input
                  id="vehicleType"
                  className="vm-input"
                  value={editingVehicle.vehicleType || ''}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>

              <div className="vm-field">
                <label className="vm-label" htmlFor="driverName">Driver name</label>
                <input
                  id="driverName"
                  className="vm-input"
                  value={editingVehicle.driverName || ''}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>

              <div className="vm-field">
                <label className="vm-label" htmlFor="driverPhone">Driver phone</label>
                <input
                  id="driverPhone"
                  className="vm-input"
                  value={editingVehicle.driverPhone || ''}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>

              <div className="vm-field">
                <label className="vm-label" htmlFor="capacity">Capacity</label>
                <input
                  id="capacity"
                  className="vm-input"
                  value={editingVehicle.capacity || ''}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>

              <div className="vm-field">
                <label className="vm-label" htmlFor="status">Status</label>
                <select
                  id="status"
                  className="vm-select"
                  value={editingVehicle.status || 'Available'}
                  onChange={(e) =>
                    setEditingVehicle((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option>Available</option>
                  <option>Busy</option>
                </select>
              </div>

              <div className="vm-form-actions">
                <button className="vm-btn vm-btn--ghost" onClick={() => setEditingVehicle(null)}>
                  Cancel
                </button>
                <button className="vm-btn vm-btn--primary" onClick={handleUpdateVehicle}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle List */}
      <div className="vm-card">
        <div className="vm-card__header">
          <h3 className="vm-card__title">Vehicles</h3>
          <span className="vm-card__count">{filteredVehicles.length} total</span>
        </div>

        <div className="vm-card__body" style={{ paddingBottom: 12 }}>
          <div className="vm-search">
            <Icon.Search />
            <input
              placeholder="Search by vehicle number, driver, or type…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="vm-loading-row">
            <Icon.Refresh />
            Loading vehicles…
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="vm-empty">
            <Icon.Inbox style={{ margin: '0 auto 10px' }} />
            <p className="vm-empty__title">No vehicles found</p>
            <p className="vm-empty__text">
              {searchTerm ? 'Try a different search term.' : 'Add your first vehicle using the form above.'}
            </p>
          </div>
        ) : (
          <div className="vm-table-wrap">
            <table className="vm-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="vm-vehicle-cell">
                        <div className="vm-vehicle-icon"><Icon.Truck /></div>
                        <div>
                          <div className="vm-vehicle-number">{v.vehicleNumber}</div>
                          <div className="vm-vehicle-type">{v.vehicleType}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{v.driverName}</div>
                      {v.driverPhone && (
                        <div className="vm-driver-phone">
                          <Icon.Phone />
                          {v.driverPhone}
                        </div>
                      )}
                    </td>
                    <td>{v.capacity}</td>
                    <td>
                      <span className={badgeClass(v.status)}>{v.status || 'Unknown'}</span>
                    </td>
                    <td>
                      <div className="vm-row-actions">
                        <button
                          className="vm-icon-btn vm-icon-btn--edit"
                          title="Edit vehicle"
                          onClick={() => setEditingVehicle({ ...v })}
                        >
                          <Icon.Edit />
                        </button>
                        <button
                          className="vm-icon-btn vm-icon-btn--delete"
                          title="Delete vehicle"
                          onClick={() => handleDeleteVehicle(v.id, v.vehicleNumber)}
                        >
                          <Icon.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicle;
