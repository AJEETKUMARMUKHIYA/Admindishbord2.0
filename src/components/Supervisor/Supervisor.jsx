import { useState, useMemo } from 'react';
import AddSupervisor from './AddSupervisor';
import SupervisorList from './SupervisorList';
import { RefreshCw, UserPlus, X } from 'lucide-react';

const Supervisor = ({ supervisors, onAddSupervisor, onToggleSupervisor, onDeleteSupervisor, onRefresh }) => {
  const [newSupervisor, setNewSupervisor] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: ''
  });
  const [panelOpen, setPanelOpen] = useState(false);

  const handleAddSupervisor = () => {
    onAddSupervisor(newSupervisor);
    setNewSupervisor({ firstName: '', lastName: '', mobile: '', email: '' });
    setPanelOpen(false);
  };

  const handleInputChange = (e) => {
    setNewSupervisor({
      ...newSupervisor,
      [e.target.id]: e.target.value
    });
  };

  // Purely presentational — doesn't touch supervisors data, just summarizes it.
  const counts = useMemo(() => {
    const list = supervisors || [];
    return {
      total: list.length,
      active: list.filter((s) => s.active).length,
      inactive: list.filter((s) => !s.active).length,
    };
  }, [supervisors]);

  const statCard = (label, value) => (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '14px 18px',
        flex: '1 1 140px',
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 700, color: 'var(--ink)' }}>
        {value}
      </div>
    </div>
  );

  return (
    <div
      id="supervisor"
      className="page"
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
          --ink: #12151C;
          --paper: #F5F6F4;
          --line: #E3E5E1;
          --accent: #2952E3;
          --accent-soft: #EAEFFD;
          --amber: #C67C1F;
          --amber-soft: #FAF0E1;
          --success: #1E8E5A;
          --danger: #C6403E;
          --muted: #6B7280;
        }
        #supervisor .au-btn { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13.5px; border-radius: 9px; padding: 9px 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; border: 1px solid transparent; transition: all 0.15s ease; }
        #supervisor .au-btn-ghost { background: #fff; border-color: var(--line); color: var(--ink); }
        #supervisor .au-btn-ghost:hover { border-color: var(--ink); }
        #supervisor .au-btn-dark { background: var(--ink); color: #fff; }
        #supervisor .au-btn-dark:hover { background: #24283a; }
        #supervisor .au-icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--line); background: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all 0.15s ease; }
        #supervisor .au-overlay { position: fixed; inset: 0; background: rgba(18,21,28,0.42); z-index: 40; display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; animation: auFade 0.15s ease; }
        #supervisor .au-panel { position: relative; width: min(680px, 100%); max-height: 88vh; background: #fff; border-radius: 16px; z-index: 50; box-shadow: 0 24px 64px rgba(18,21,28,0.28); animation: auPop 0.18s cubic-bezier(.32,.72,0,1); display: flex; flex-direction: column; overflow: hidden; }
        @keyframes auFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes auPop { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        #supervisor .au-list-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--accent)', fontWeight: 500, letterSpacing: 0.4, marginBottom: 6 }}>
            TEAM MANAGEMENT
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: -0.4 }}>
            Supervisors
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="au-btn au-btn-ghost" onClick={onRefresh}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="au-btn au-btn-dark" onClick={() => setPanelOpen(true)}>
            <UserPlus size={15} /> Add supervisor
          </button>
        </div>
      </div>

      {/* Stat strip — presentational summary of the supervisors prop */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {statCard('Total', counts.total)}
        {statCard('Active', counts.active)}
        {statCard('Inactive', counts.inactive)}
      </div>

      {/* Existing SupervisorList component, untouched, just wrapped in the same card shell as AdminUsers */}
      <div className="au-list-card">
        <SupervisorList
          supervisors={supervisors}
          onToggleSupervisor={onToggleSupervisor}
          onDeleteSupervisor={onDeleteSupervisor}
        />
      </div>

      {/* Add supervisor modal — same shell as AdminUsers' Add admin modal, wrapping the existing AddSupervisor component unchanged */}
      {panelOpen && (
        <div className="au-overlay" onClick={() => setPanelOpen(false)}>
          <div className="au-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, color: 'var(--accent)', marginBottom: 4 }}>NEW TEAM MEMBER</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 19 }}>Add supervisor</div>
              </div>
              <button className="au-icon-btn" onClick={() => setPanelOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
              <AddSupervisor
                supervisor={newSupervisor}
                onInputChange={handleInputChange}
                onAddSupervisor={handleAddSupervisor}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supervisor;
