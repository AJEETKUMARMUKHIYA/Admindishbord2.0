import './StatCard.css';

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    primary: 'var(--primary-color)',
    warning: 'var(--warning-color)',
    success: 'var(--success-color)',
    danger: 'var(--danger-color)',
    info: 'var(--info-color)'
  };

  const cardStyle = {
    borderLeftColor: colorMap[color]
  };

  return (
    <div className="stat-card-wrapper">
      <div className="card-box stat-card" style={cardStyle}>
        <h6>{title}</h6>
        <h3>{value}</h3>
        <div className="stat-icon" style={{ background: colorMap[color] }}>
          <i className={icon}></i>
        </div>
      </div>
    </div>
  );
};

export default StatCard;