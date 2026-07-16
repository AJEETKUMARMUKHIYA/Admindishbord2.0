const QuickStats = ({ activeSupervisors, totalSupervisors }) => {
  return (
    <div className="quick-stats-card card-box">
      <div className="card-header">
        <i className="fas fa-chart-line me-2"></i> Quick Stats
      </div>
      <div className="p-4">
        <p className="mb-2">
          <strong>Avg. Resolution Time:</strong> 
          <span className="text-primary"> 2.4 days</span>
        </p>
        <p className="mb-2">
          <strong>Customer Satisfaction:</strong> 
          <span className="text-success"> 94%</span>
        </p>
        <p className="mb-0">
          <strong>Supervisors Active:</strong> 
          <span> {activeSupervisors} of {totalSupervisors}</span>
        </p>
      </div>
    </div>
  );
};

export default QuickStats;