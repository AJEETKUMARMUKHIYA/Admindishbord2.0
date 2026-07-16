import { useState, useMemo } from 'react';
import TicketTabs from './TicketTabs';
import * as XLSX from 'xlsx';
import { showToast } from '../../utils/toast';
import  './tickets.css'
const ROWS_PER_PAGE = 12;

const Tickets = ({ tickets, supervisors, onAssignTicket, onUpdateTicket, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('new');
  const [selectedSupervisor, setSelectedSupervisor] = useState({});

  const [currentPage, setCurrentPage] = useState({
    new: 1,
    progress: 1,
    cancel: 1,
    closed: 1
  });

  // Search (filters by Booking ID across all tabs)
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket currently open in the View modal (null = closed)
  const [viewTicket, setViewTicket] = useState(null);

  // ================= COMMON =================

  const paginate = (data, tab) => {
    const start = (currentPage[tab] - 1) * ROWS_PER_PAGE;
    return data.slice(start, start + ROWS_PER_PAGE);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Jump every tab back to page 1 so filtered results are visible
    setCurrentPage({ new: 1, progress: 1, cancel: 1, closed: 1 });
  };

  const matchesSearch = (t) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return String(t.bookingID ?? '').toLowerCase().includes(query);
  };

  const Pagination = ({ total, tab }) => {
    const pages = Math.ceil(total / ROWS_PER_PAGE);
    if (pages <= 1) return null;

    return (
      <nav className="mt-3">
        <ul className="pagination justify-content-end">
          <li className={`page-item ${currentPage[tab] === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage({ ...currentPage, [tab]: currentPage[tab] - 1 })
              }
            >
              Prev
            </button>
          </li>

          {[...Array(pages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage[tab] === i + 1 ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() =>
                  setCurrentPage({ ...currentPage, [tab]: i + 1 })
                }
              >
                {i + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage[tab] === pages ? 'disabled' : ''
            }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setCurrentPage({ ...currentPage, [tab]: currentPage[tab] + 1 })
              }
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // ================= ACTIONS =================

  const handleStatusChange = (id, status) => {
    if (window.confirm(`Change ticket status to ${status}?`)) {
      onUpdateTicket(id, { status });
      showToast(`Ticket marked as ${status}`, 'success');
    }
  };

  const handleAssign = (ticketId, supervisorId) => {
    const sup = supervisors.find(s => s.userId === supervisorId);
    if (!sup) return;

    onAssignTicket(ticketId, supervisorId);
    setSelectedSupervisor(prev => ({ ...prev, [ticketId]: supervisorId }));
    showToast(`Assigned to ${sup.firstName} ${sup.lastName}`, 'success');
  };

  const handleDownloadExcel = () => {
    const data = tickets.map(t => ({
      TicketID: t.ticketNo,
      BookingID: t.bookingID,
      From: t.fromLocation,
      To: t.toLocation,
      Status: t.status,
      Assigned:
        supervisors.find(s => s.userId === t.assignedSupervisorID)?.firstName ||
        'Unassigned'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
    XLSX.writeFile(wb, 'Tickets_Report.xlsx');

    showToast('Excel downloaded successfully', 'success');
  };

  const handleView = (ticket) => {
    setViewTicket(ticket);
  };

  const closeViewModal = () => setViewTicket(null);

  // ================= DATA =================

  const newTickets = useMemo(
    () => tickets.filter(t => t.status === 'Open').filter(matchesSearch),
    [tickets, searchQuery]
  );
  const progressTickets = useMemo(
    () => tickets.filter(t => t.status === 'In Progress').filter(matchesSearch),
    [tickets, searchQuery]
  );
  const cancelledTickets = useMemo(
    () => tickets.filter(t => t.status === 'Cancelled').filter(matchesSearch),
    [tickets, searchQuery]
  );
  const closedTickets = useMemo(
    () => tickets.filter(t => t.status === 'Closed').filter(matchesSearch),
    [tickets, searchQuery]
  );

  const viewTicketSupervisor = viewTicket
    ? supervisors.find(s => s.userId === viewTicket.assignedSupervisorID)
    : null;

  // ================= UI =================

  return (
    <div id="tickets" className="page">
      <h2 className="page-title mb-3">Ticket Management</h2>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <TicketTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tickets={tickets}
          />
        </div>

        <div className="card-body">

          {/* ================= SEARCH ================= */}
          <div className="row mb-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Booking ID"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    title="Clear search"
                    onClick={() => handleSearchChange({ target: { value: '' } })}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ================= OPEN ================= */}
          {activeTab === 'new' && (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Ticket</th>
                      <th>Booking</th>
                      <th>Route</th>
                      <th>Status</th>
                      {/* <th>Assign</th> */}
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newTickets.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          {searchQuery
                            ? `No open tickets found for Booking ID "${searchQuery}".`
                            : 'No open tickets.'}
                        </td>
                      </tr>
                    ) : (
                      paginate(newTickets, 'new').map(t => (
                        <tr key={t.ticketID}>
                          <td className="fw-semibold">{t.ticketNo}</td>
                          <td>{t.bookingID}</td>
                          <td>{t.fromLocation} → {t.toLocation}</td>
                          <td><span className="badge bg-primary">Open</span></td>
                          {/* <td>
                            <select
                              className="form-select form-select-sm"
                              value={selectedSupervisor[t.ticketID] || ''}
                              onChange={e =>
                                handleAssign(t.ticketID, Number(e.target.value))
                              }
                            >
                              <option value="">Unassigned</option>
                              {supervisors.filter(s => s.active).map(s => (
                                <option key={s.userId} value={s.userId}>
                                  {s.firstName} {s.lastName}
                                </option>
                              ))}
                            </select>
                          </td> */}
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-secondary"
                                title="View"
                                onClick={() => handleView(t)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>

                              {/* <button
                                className="btn btn-outline-primary"
                                title="Start"
                                onClick={() =>
                                  handleStatusChange(t.ticketID, 'In Progress')
                                }
                              >
                                <i className="fas fa-play"></i>
                              </button> */}

                              {/* <button
                                className="btn btn-outline-danger"
                                title="Cancel"
                                onClick={() =>
                                  handleStatusChange(t.ticketID, 'Cancelled')
                                }
                              >
                                <i className="fas fa-times"></i>
                              </button> */}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={newTickets.length} tab="new" />
            </>
          )}

          {/* ================= PROGRESS ================= */}
          {activeTab === 'progress' && (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Ticket</th>
                      <th>Booking</th>
                      <th>Route</th>
                      <th>Status</th>
                      <th>Assigned</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressTickets.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          {searchQuery
                            ? `No in-progress tickets found for Booking ID "${searchQuery}".`
                            : 'No tickets in progress.'}
                        </td>
                      </tr>
                    ) : (
                      paginate(progressTickets, 'progress').map(t => {
                        const sup = supervisors.find(
                          s => s.userId === t.assignedSupervisorID
                        );
                        return (
                          <tr key={t.ticketID}>
                            <td>{t.ticketNo}</td>
                            <td>{t.bookingID}</td>
                            <td>{t.fromLocation} → {t.toLocation}</td>
                            <td><span className="badge bg-warning text-dark">In Progress</span></td>
                            <td>{sup ? `${sup.firstName} ${sup.lastName}` : 'N/A'}</td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-secondary"
                                  title="View"
                                  onClick={() => handleView(t)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() =>
                                    handleStatusChange(t.ticketID, 'Closed')
                                  }
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    handleStatusChange(t.ticketID, 'Cancelled')
                                  }
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={progressTickets.length} tab="progress" />
            </>
          )}

          {/* ================= CANCELLED ================= */}
          {activeTab === 'cancel' && (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Ticket</th>
                      <th>Booking</th>
                      <th>Route</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancelledTickets.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          {searchQuery
                            ? `No cancelled tickets found for Booking ID "${searchQuery}".`
                            : 'No cancelled tickets.'}
                        </td>
                      </tr>
                    ) : (
                      paginate(cancelledTickets, 'cancel').map(t => (
                        <tr key={t.ticketID}>
                          <td>{t.ticketNo}</td>
                          <td>{t.bookingID}</td>
                          <td>{t.fromLocation} → {t.toLocation}</td>
                          <td><span className="badge bg-danger">Cancelled</span></td>
                          <td>{t.reason || '—'}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              title="View"
                              onClick={() => handleView(t)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={cancelledTickets.length} tab="cancel" />
            </>
          )}

          {/* ================= CLOSED ================= */}
          {activeTab === 'closed' && (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Ticket</th>
                      <th>Booking</th>
                      <th>Route</th>
                      <th>Status</th>
                      <th>Assigned</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedTickets.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          {searchQuery
                            ? `No closed tickets found for Booking ID "${searchQuery}".`
                            : 'No closed tickets.'}
                        </td>
                      </tr>
                    ) : (
                      paginate(closedTickets, 'closed').map(t => {
                        const sup = supervisors.find(
                          s => s.userId === t.assignedSupervisorID
                        );
                        return (
                          <tr key={t.ticketID}>
                            <td>{t.ticketNo}</td>
                            <td>{t.bookingID}</td>
                            <td>{t.fromLocation} → {t.toLocation}</td>
                            <td><span className="badge bg-success">Closed</span></td>
                            <td>{sup ? `${sup.firstName} ${sup.lastName}` : '—'}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                title="View"
                                onClick={() => handleView(t)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={closedTickets.length} tab="closed" />
            </>
          )}
        </div>

        <div className="card-footer d-flex justify-content-between">
          <button className="btn btn-outline-primary" onClick={onRefresh}>
            Refresh
          </button>

          <button className="btn btn-success" onClick={handleDownloadExcel}>
            Download Excel
          </button>
        </div>
      </div>
{/* ================= VIEW TICKET MODAL ================= */}
{viewTicket && (
  <>
    <div
      className="modal fade show"
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1055,
        overflowY: 'auto',
      }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 480, margin: '1.75rem auto' }}
      >
        <div
          className="modal-content"
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          <div
            className="modal-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #dee2e6',
            }}
          >
            <h5 className="modal-title mb-0">Ticket {viewTicket.ticketNo}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={closeViewModal}
            ></button>
          </div>

          <div className="modal-body" style={{ padding: '1.25rem' }}>
            {[
              ['Booking ID', viewTicket.bookingID],
              ['Route', `${viewTicket.fromLocation} → ${viewTicket.toLocation}`],
              ['Status', viewTicket.status],
              [
                'Assigned Supervisor',
                viewTicketSupervisor
                  ? `${viewTicketSupervisor.firstName} ${viewTicketSupervisor.lastName}`
                  : 'Unassigned',
              ],
              ...(viewTicket.reason ? [['Reason', viewTicket.reason]] : []),
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '0.4rem 0',
                  borderBottom: '1px solid #f1f1f1',
                }}
              >
                <div style={{ flex: '0 0 45%', fontWeight: 600, color: '#555' }}>
                  {label}
                </div>
                <div style={{ flex: 1 }}>{value}</div>
              </div>
            ))}
          </div>

          <div
            className="modal-footer"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '1rem 1.25rem',
              borderTop: '1px solid #dee2e6',
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={closeViewModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      className="modal-backdrop fade show"
      onClick={closeViewModal}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
      }}
    ></div>
  </>
)}
    </div>
  );
};

export default Tickets;
