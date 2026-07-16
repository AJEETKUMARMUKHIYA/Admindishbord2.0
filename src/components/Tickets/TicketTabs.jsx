import React from 'react';
import { 
  PlusCircle, 
  Clock, 
  XCircle, 
  CheckCircle 
} from 'lucide-react';

const TicketTabs = ({ activeTab, onTabChange, tickets }) => {
  const tabConfig = [
    { id: 'new', icon: PlusCircle, label: 'Open Tickets', badgeClass: 'badge-new', status: 'Open' },
    { id: 'progress', icon: Clock, label: 'In Progress', badgeClass: 'badge-progress', status: 'In Progress' },
    { id: 'cancel', icon: XCircle, label: 'Cancelled', badgeClass: 'badge-cancelled', status: 'Cancelled' },
    { id: 'closed', icon: CheckCircle, label: 'Closed/Resolved', badgeClass: 'badge-closed', status: 'Closed' }
  ];

  const getTicketCount = (status) => {
    return tickets.filter(ticket => ticket.status === status).length;
  };

  return (
    <div className="ticket-tabs-container">
      <style>{`
        .ticket-tabs-container {
          display: flex;
          border-bottom: 1.5px solid #e2e8f0;
          background-color: #ffffff;
          padding: 4px 16px 0;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
        }
        .ticket-tabs-container::-webkit-scrollbar {
          display: none; /* Safari/Chrome */
        }
        .tab-item-btn {
          background: none;
          border: none;
          padding: 12px 18px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .tab-item-btn:hover {
          color: #0f172a;
        }
        .tab-item-btn.active {
          color: #2563eb;
        }
        .tab-item-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1.5px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2563eb 0%, #06b6d4 100%);
          border-radius: 99px;
        }
        .tab-badge {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 99px;
          transition: all 0.15s ease;
        }
        .tab-badge.badge-new {
          background-color: #eff6ff;
          color: #2563eb;
        }
        .tab-badge.badge-progress {
          background-color: #fefbeb;
          color: #d97706;
        }
        .tab-badge.badge-cancelled {
          background-color: #fef2f2;
          color: #ef4444;
        }
        .tab-badge.badge-closed {
          background-color: #ecfdf5;
          color: #10b981;
        }
        .tab-item-btn.active .tab-badge {
          transform: scale(1.05);
        }
      `}</style>

      {tabConfig.map(tab => {
        const IconComponent = tab.icon;
        const count = getTicketCount(tab.status);

        return (
          <button
            key={tab.id}
            type="button"
            className={`tab-item-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <IconComponent size={15} />
            <span>{tab.label}</span>
            <span className={`tab-badge ${tab.badgeClass}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TicketTabs;
