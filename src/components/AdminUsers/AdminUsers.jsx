import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import AddAdmin from './AddAdmin';
import {
  RefreshCw,
  FileDown,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X,
  Shield,
  ShieldCheck,
  ChevronDown,
  Mail,
  Phone,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const PAGE_SIZE = 10;

const initials = (first, last) => `${(first || '?')[0]}${(last || '?')[0]}`.toUpperCase();

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--ink)',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: 10,
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 12px 32px rgba(18,21,28,0.28)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        letterSpacing: 0.1,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-bright)', flexShrink: 0 }} />
      {toast}
    </div>
  );
}

const AdminUsers = ({ adminUsers, onRefresh, onAddAdmin, onEditAdmin, onDeleteAdmin }) => {
  const users = adminUsers || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [newAdmin, setNewAdmin] = useState({ firstName: '', lastName: '', mobile: '', email: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Whenever the visible set changes shape (search/filter), snap back to page 1
  // so the user isn't stranded on a page that no longer has any rows.
  const setFilterAndResetPage = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const flashToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleInputChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.id]: e.target.value });
  };

  const handleAddAdmin = () => {
    if (!newAdmin.firstName || !newAdmin.email) {
      flashToast('First name and email are required');
      return;
    }
    if (onAddAdmin) onAddAdmin(newAdmin);
    setNewAdmin({ firstName: '', lastName: '', mobile: '', email: '' });
    setPanelOpen(false);
    flashToast(`${newAdmin.firstName} was added to the team`);
  };

  const counts = useMemo(() => ({
    total: users.length,
    admin: users.filter((u) => u.roleId === 1).length,
    supervisor: users.filter((u) => u.roleId === 2).length,
    active: users.filter((u) => u.active).length,
  }), [users]);

  const filteredUsers = users.filter((user) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      user.firstName.toLowerCase().includes(q) ||
      user.lastName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.mobile.includes(searchTerm);

    const matchesRole =
      filterRole === 'all' ||
      (filterRole === 'admin' && user.roleId === 1) ||
      (filterRole === 'supervisor' && user.roleId === 2);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.active) ||
      (filterStatus === 'inactive' && !user.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paginatedUsers = filteredUsers.slice(pageStart, pageStart + PAGE_SIZE);

  const handleDownloadExcel = () => {
    const exportData = users.map((user) => ({
      'User ID': user.userId,
      'First Name': user.firstName,
      'Last Name': user.lastName,
      Email: user.email,
      Mobile: user.mobile,
      Role: user.roleId === 1 ? 'Admin' : 'Supervisor',
      Status: user.active ? 'Active' : 'Inactive',
      'Created Date': user.createdDate,
      'Last Activity': user.lastActivityDate,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AdminUsers');
    XLSX.writeFile(wb, 'AdminUsers_Report.xlsx');
    alert('Admin users report downloaded successfully!');
  };

  const statCard = (label, value, roleKey, statusKey) => {
    const isActive =
      (roleKey && filterRole === roleKey) || (statusKey && filterStatus === statusKey);
    return (
      <button
        onClick={() => {
          if (roleKey !== undefined) setFilterAndResetPage(setFilterRole)(roleKey === filterRole ? 'all' : roleKey);
          if (statusKey !== undefined) setFilterAndResetPage(setFilterStatus)(statusKey === filterStatus ? 'all' : statusKey);
        }}
        style={{
          fontFamily: 'Inter, sans-serif',
          textAlign: 'left',
          background: isActive ? 'var(--ink)' : '#fff',
          border: `1px solid ${isActive ? 'var(--ink)' : 'var(--line)'}`,
          borderRadius: 12,
          padding: '14px 18px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          flex: '1 1 140px',
          minWidth: 140,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: isActive ? 'rgba(255,255,255,0.55)' : 'var(--muted)', marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 700, color: isActive ? '#fff' : 'var(--ink)' }}>
          {value}
        </div>
      </button>
    );
  };

  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        background: 'var(--paper)',
        minHeight: '100%',
        padding: '32px clamp(16px, 4vw, 48px)',
        color: 'var(--ink)',
        position: 'relative',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        :root {
          --ink: #0f172a;
          --paper: #f8fafc;
          --line: #cbd5e1;
          --accent: #2563eb;
          --accent-bright: #06b6d4;
          --accent-soft: #eff6ff;
          --amber: #f59e0b;
          --amber-soft: #fefbeb;
          --success: #10b981;
          --success-soft: #ecfdf5;
          --danger: #ef4444;
          --danger-soft: #fef2f2;
          --muted: #64748b;
        }
        .au-btn { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13.5px; border-radius: 9px; padding: 9px 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; border: 1px solid transparent; transition: all 0.15s ease; }
        .au-btn-ghost { background: #fff; border-color: var(--line); color: var(--ink); }
        .au-btn-ghost:hover { border-color: var(--ink); }
        .au-btn-dark { background: var(--ink); color: #fff; }
        .au-btn-dark:hover { background: #24283a; }
        .au-btn-accent { background: var(--accent); color: #fff; }
        .au-btn-accent:hover { background: #2141c2; }
        .au-row:hover { background: #FAFBFC; }
        .au-icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--line); background: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all 0.15s ease; }
        .au-icon-btn:hover.edit { border-color: var(--accent); color: var(--accent); }
        .au-icon-btn:hover.del { border-color: var(--danger); color: var(--danger); }
        .au-input:focus, .au-select:focus { outline: none; border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-soft); }
        .au-overlay { position: fixed; inset: 0; background: rgba(18,21,28,0.42); z-index: 40; animation: auFade 0.15s ease; display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; }
        .au-panel { position: relative; width: min(680px, 100%); max-height: 88vh; background: #fff; border-radius: 16px; z-index: 50; box-shadow: 0 24px 64px rgba(18,21,28,0.28); animation: auPop 0.18s cubic-bezier(.32,.72,0,1); display: flex; flex-direction: column; overflow: hidden; }
        @keyframes auFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes auPop { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .au-field label { display:block; font-size: 12.5px; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
        .au-field input { width: 100%; box-sizing: border-box; border: 1px solid var(--line); border-radius: 9px; padding: 10px 12px; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--accent)', fontWeight: 500, letterSpacing: 0.4, marginBottom: 6 }}>
            TEAM MANAGEMENT
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: -0.4 }}>
            Admin Users
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="au-btn au-btn-ghost" onClick={onRefresh}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="au-btn au-btn-ghost" onClick={handleDownloadExcel}>
            <FileDown size={15} /> Export
          </button>
          <button className="au-btn au-btn-dark" onClick={() => setPanelOpen(true)}>
            <UserPlus size={15} /> Add admin
          </button>
        </div>
      </div>

      {/* Stat strip — doubles as quick filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {statCard('Total', counts.total)}
        {statCard('Admins', counts.admin, 'admin')}
        {statCard('Supervisors', counts.supervisor, 'supervisor')}
        {statCard('Active', counts.active, undefined, 'active')}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            className="au-input"
            type="text"
            placeholder="Search by name, email, or mobile"
            value={searchTerm}
            onChange={(e) => setFilterAndResetPage(setSearchTerm)(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 14px 10px 38px',
              borderRadius: 9, border: '1px solid var(--line)', fontFamily: 'Inter, sans-serif',
              fontSize: 14, background: '#fff',
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            className="au-select"
            value={filterRole}
            onChange={(e) => setFilterAndResetPage(setFilterRole)(e.target.value)}
            style={{
              appearance: 'none', padding: '10px 36px 10px 14px', borderRadius: 9,
              border: '1px solid var(--line)', fontFamily: 'Inter, sans-serif', fontSize: 14,
              background: '#fff', cursor: 'pointer', minWidth: 160,
            }}
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            className="au-select"
            value={filterStatus}
            onChange={(e) => setFilterAndResetPage(setFilterStatus)(e.target.value)}
            style={{
              appearance: 'none', padding: '10px 36px 10px 14px', borderRadius: 9,
              border: '1px solid var(--line)', fontFamily: 'Inter, sans-serif', fontSize: 14,
              background: '#fff', cursor: 'pointer', minWidth: 150,
            }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Users list</span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--muted)' }}>
            {filteredUsers.length === 0
              ? `0 of ${users.length}`
              : `${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, filteredUsers.length)} of ${filteredUsers.length}`}
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{ padding: '56px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            <Inbox size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
            <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>No matching users</div>
            <div style={{ fontSize: 13.5 }}>Adjust the search or filters to see more results.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#FAFBFA' }}>
                  {['User', 'Contact', 'Role', 'Status', 'Since', ''].map((h, i) => (
                    <th key={i} style={{
                      textAlign: h === '' ? 'right' : 'left', padding: '10px 20px', fontSize: 11.5,
                      fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--muted)',
                      borderBottom: '1px solid var(--line)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.userId} className="au-row" style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                          fontSize: 13, color: user.roleId === 1 ? 'var(--accent)' : 'var(--amber)',
                          background: user.roleId === 1 ? 'var(--accent-soft)' : 'var(--amber-soft)',
                          border: `1.5px solid ${user.roleId === 1 ? 'var(--accent)' : 'var(--amber)'}`,
                          flexShrink: 0,
                        }}>
                          {initials(user.firstName, user.lastName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
                          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, color: 'var(--muted)' }}>{user.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink)', marginBottom: 3 }}>
                        <Mail size={12} style={{ color: 'var(--muted)' }} /> {user.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 12.5 }}>
                        <Phone size={12} /> {user.mobile}
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999,
                        fontSize: 12, fontWeight: 600,
                        color: user.roleId === 1 ? 'var(--accent)' : 'var(--amber)',
                        background: user.roleId === 1 ? 'var(--accent-soft)' : 'var(--amber-soft)',
                      }}>
                        {user.roleId === 1 ? <ShieldCheck size={13} /> : <Shield size={13} />}
                        {user.roleId === 1 ? 'Admin' : 'Supervisor'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600,
                        color: user.active ? 'var(--success)' : 'var(--muted)',
                      }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: user.active ? 'var(--success)' : '#C7CACC',
                        }} />
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--muted)', fontSize: 12.5 }}>
                      {user.createdDate}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          className="au-icon-btn edit"
                          onClick={() => onEditAdmin && onEditAdmin(user)}
                          title="Edit user"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="au-icon-btn del"
                          onClick={() => {
                            if (window.confirm(`Delete user ${user.firstName} ${user.lastName}?`)) {
                              onDeleteAdmin && onDeleteAdmin(user);
                            }
                          }}
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredUsers.length > 0 && totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px', borderTop: '1px solid var(--line)', flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              Page <strong style={{ color: 'var(--ink)' }}>{safePage}</strong> of {totalPages}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                className="au-icon-btn"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{ opacity: safePage === 1 ? 0.4 : 1, cursor: safePage === 1 ? 'not-allowed' : 'pointer' }}
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('ellipsis-' + p);
                  acc.push(p);
                  return acc;
                }, [])
                .map((p) =>
                  typeof p === 'string' ? (
                    <span key={p} style={{ padding: '0 4px', color: 'var(--muted)', fontSize: 13 }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      style={{
                        width: 32, height: 32, borderRadius: 8, fontFamily: 'Inter, sans-serif',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${p === safePage ? 'var(--ink)' : 'var(--line)'}`,
                        background: p === safePage ? 'var(--ink)' : '#fff',
                        color: p === safePage ? '#fff' : 'var(--ink)',
                      }}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                className="au-icon-btn"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{ opacity: safePage === totalPages ? 0.4 : 1, cursor: safePage === totalPages ? 'not-allowed' : 'pointer' }}
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add admin modal */}
      {panelOpen && (
        <div className="au-overlay" onClick={() => setPanelOpen(false)}>
          <div className="au-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, color: 'var(--accent)', marginBottom: 4 }}>NEW TEAM MEMBER</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 19 }}>Add admin</div>
              </div>
              <button className="au-icon-btn" onClick={() => setPanelOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
              <AddAdmin
                admin={newAdmin}
                onInputChange={handleInputChange}
                onAddAdmin={handleAddAdmin}
              />
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
};

export default AdminUsers;
