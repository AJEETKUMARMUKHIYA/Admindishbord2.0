import React from 'react';
import { 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  UserCheck, 
  UserX,
  Users
} from 'lucide-react';

const SupervisorList = ({ supervisors = [], onToggleSupervisor, onDeleteSupervisor, onEditSupervisor }) => {
  return (
    <div className="sp-table-container">
      <table className="sp-table">
        <thead>
          <tr>
            <th>ID Tag</th>
            <th>Supervisor Identity</th>
            <th>Mobile Contact</th>
            <th>Email Address</th>
            <th>Duty Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {supervisors.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="sp-empty-state">
                  <div className="sp-empty-state__icon">
                    <Users size={40} />
                  </div>
                  <h4>No Supervisors Found</h4>
                  <p>There are no registered supervisors matching your filters in the command center database.</p>
                </div>
              </td>
            </tr>
          ) : (
            supervisors.map((supervisor, index) => {
              const first = supervisor.firstName || '';
              const last = supervisor.lastName || '';
              const fullName = `${first} ${last}`.trim() || 'No Name';
              const initials = (first.charAt(0) + last.charAt(0)).toUpperCase() || '?';

              return (
                <tr key={supervisor.userId || index}>
                  <td>
                    <span className="sp-id-tag">
                      #{supervisor.userId || `S-${index + 1}`}
                    </span>
                  </td>
                  <td>
                    <div className="sp-member-cell">
                      <div className={`sp-member-avatar ${supervisor.active ? 'sp-pulse' : ''}`}>
                        {initials}
                      </div>
                      <div className="sp-member-info">
                        <span className="sp-member-name">{fullName}</span>
                        <span className="sp-member-role">Field Supervisor</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {supervisor.mobile ? (
                      <a href={`tel:${supervisor.mobile}`} className="sp-contact-link" title={`Call ${fullName}`}>
                        <Phone size={12} />
                        <span>{supervisor.mobile}</span>
                      </a>
                    ) : (
                      <span style={{ color: 'var(--sp-text-mute)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>
                    {supervisor.email ? (
                      <a href={`mailto:${supervisor.email}`} className="sp-contact-link" title={`Email ${fullName}`}>
                        <Mail size={12} />
                        <span>{supervisor.email}</span>
                      </a>
                    ) : (
                      <span style={{ color: 'var(--sp-text-mute)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`sp-status-pill ${supervisor.active ? 'active' : 'inactive'}`}>
                      {supervisor.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="sp-row-actions">
                      {/* Toggle status (Activate / Deactivate) */}
                      <button
                        type="button"
                        onClick={() => onToggleSupervisor(supervisor)}
                        className={`sp-icon-btn ${supervisor.active ? 'warning' : 'success'}`}
                        title={supervisor.active ? "Put on Standby" : "Activate Supervisor"}
                      >
                        {supervisor.active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>

                      {/* Edit supervisor details */}
                      <button
                        type="button"
                        onClick={() => onEditSupervisor(supervisor)}
                        className="sp-icon-btn"
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete supervisor */}
                      <button
                        type="button"
                        onClick={() => onDeleteSupervisor(supervisor.userId)}
                        className="sp-icon-btn danger"
                        title="Delete Permanently"
                      >
                        <Trash2 size={14} />
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
  );
};

export default SupervisorList;
