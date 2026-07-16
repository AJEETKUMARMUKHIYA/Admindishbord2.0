const AddSupervisor = ({ supervisor, onInputChange, onAddSupervisor }) => {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-gradient-primary text-white d-flex align-items-center">
        <i className="fas fa-user-plus me-3 fs-4"></i>
        <h5 className="mb-0">Add New Supervisor</h5>
      </div>

      <div className="card-body p-4">
        <div className="row g-4">
          <div className="col-md-6">
            <label htmlFor="firstName" className="form-label">First Name *</label>
            <input
              id="firstName"
              className="form-control form-control-lg"
              placeholder="Enter first name"
              value={supervisor.firstName || ''}
              onChange={onInputChange}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="lastName" className="form-label">Last Name *</label>
            <input
              id="lastName"
              className="form-control form-control-lg"
              placeholder="Enter last name"
              value={supervisor.lastName || ''}
              onChange={onInputChange}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="mobile" className="form-label">Mobile Number *</label>
            <input
              id="mobile"
              type="tel"
              className="form-control form-control-lg"
              placeholder="10-digit mobile number"
              value={supervisor.mobile || ''}
              onChange={onInputChange}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input
              id="email"
              type="email"
              className="form-control form-control-lg"
              placeholder="name@example.com"
              value={supervisor.email || ''}
              onChange={onInputChange}
            />
          </div>

          <div className="col-md-12">
            <label htmlFor="password" className="form-label">Password *</label>
            <input
              id="password"
              type="password"
              className="form-control form-control-lg"
              placeholder="Create strong password"
              value={supervisor.password || ''}
              onChange={onInputChange}
            />
          </div>

          <div className="col-12 mt-3">
            <button
              className="btn btn-primary btn-lg w-100"
              onClick={onAddSupervisor}
              disabled={
                !supervisor.firstName?.trim() ||
                !supervisor.lastName?.trim() ||
                !supervisor.mobile?.trim() ||
                !supervisor.email?.trim() ||
                !supervisor.password?.trim()
              }
            >
              <i className="fas fa-user-plus me-2"></i>
              Create Supervisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSupervisor;