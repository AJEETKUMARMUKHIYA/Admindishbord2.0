const TicketTabs = ({ activeTab, onTabChange, tickets }) => {
  const tabConfig = [
    { id: 'new', icon: 'fas fa-plus-circle', label: 'New', badgeClass: 'badge-new' },
    { id: 'progress', icon: 'fas fa-spinner', label: 'In Progress', badgeClass: 'badge-progress' },
    { id: 'cancel', icon: 'fas fa-times', label: 'Cancelled', badgeClass: 'badge-cancelled' },
    { id: 'closed', icon: 'fas fa-check', label: 'Closed', badgeClass: 'badge-closed' }
  ];

  const getTicketCount = (status) => {
    return tickets.filter(ticket => ticket.status === status).length;
  };

  return (
    <ul className="nav nav-tabs card-header-tabs">
      {tabConfig.map(tab => {
        const count = getTicketCount(
          tab.id === 'new' ? 'New' :
          tab.id === 'progress' ? 'In Progress' :
          tab.id === 'cancel' ? 'Cancelled' : 'Closed'
        );

        return (
          <li className="nav-item" key={tab.id}>
            <a
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              style={{ cursor: 'pointer' }}
            >
              <i className={`${tab.icon} me-1`}></i>
              {tab.label}
              <span className={`badge ${tab.badgeClass} ms-1`}>{count}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default TicketTabs;