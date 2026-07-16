const SupervisorList = ({ supervisors, onToggleSupervisor, onDeleteSupervisor }) => {
  return (
    <div className="card-box">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-users me-2"></i> Supervisor List
        </div>
        <div>
          <span className="badge bg-primary">Total: {supervisors.length}</span>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.map((supervisor, index) => (
              <tr key={supervisor.userId || index}>
                <td className="fw-medium">{supervisor.userId}</td>
                <td>{supervisor.firstName}</td>
                <td>{supervisor.lastName}</td>
                <td>{supervisor.mobile}</td>
                <td>{supervisor.email}</td>
                <td>
                  <span className={`badge ${supervisor.active ? 'badge-active' : 'badge-inactive'}`}>
                    {supervisor.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => onToggleSupervisor(index)}
                  >
                    {supervisor.active ? (
                      <i className="fas fa-user-slash"></i>
                    ) : (
                      <i className="fas fa-user-check"></i>
                    )}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDeleteSupervisor(index)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupervisorList;