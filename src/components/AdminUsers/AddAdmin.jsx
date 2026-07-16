import React from 'react';

const AddAdmin = ({ admin, onInputChange, onAddAdmin }) => {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-gradient-primary text-white d-flex align-items-center">
        <i className="fas fa-user-plus me-3 fs-4"></i>
        <h5 className="mb-0">Add New Admin User</h5>
      </div>

      <div className="card-body p-4">
        <form>
          <div className="row g-4">
            {/* First Name */}
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label fw-medium text-muted">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                className="form-control form-control-lg"
                placeholder="Enter first name"
                value={admin.firstName || ''}
                onChange={onInputChange}
                required
              />
            </div>

            {/* Last Name */}
            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label fw-medium text-muted">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                className="form-control form-control-lg"
                placeholder="Enter last name"
                value={admin.lastName || ''}
                onChange={onInputChange}
                required
              />
            </div>

            {/* Mobile */}
            <div className="col-md-6">
              <label htmlFor="mobile" className="form-label fw-medium text-muted">
                Mobile Number <span className="text-danger">*</span>
              </label>
              <input
                id="mobile"
                type="tel"
                className="form-control form-control-lg"
                placeholder="Enter 10-digit mobile number"
                value={admin.mobile || ''}
                onChange={onInputChange}
                required
              />
            </div>

            {/* Email */}
            <div className="col-md-6">
              <label htmlFor="email" className="form-label fw-medium text-muted">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                type="email"
                className="form-control form-control-lg"
                placeholder="name@example.com"
                value={admin.email || ''}
                onChange={onInputChange}
                required
              />
            </div>

            {/* Password */}
            <div className="col-md-12">
              <label htmlFor="password" className="form-label fw-medium text-muted">
                Password <span className="text-danger">*</span>
              </label>
              <input
                id="password"
                type="password"
                className="form-control form-control-lg"
                placeholder="Create a strong password"
                value={admin.password || ''}
                onChange={onInputChange}
                required
              />
              <small className="form-text text-muted mt-1">
                Minimum 8 characters, include letters, numbers & symbols
              </small>
            </div>

            {/* Submit Button */}
            <div className="col-12 mt-4">
              <button
                type="button"
                className="btn btn-primary btn-lg w-100 fw-bold"
                onClick={onAddAdmin}
                disabled={
                  !admin.firstName?.trim() ||
                  !admin.lastName?.trim() ||
                  !admin.mobile?.trim() ||
                  !admin.email?.trim() ||
                  !admin.password?.trim()
                }
              >
                <i className="fas fa-user-plus me-2"></i>
                Create Admin Account
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Optional: subtle footer with hint */}
      <div className="card-footer bg-light text-center text-muted py-3">
        <small>All fields are required • Password will be sent to the user</small>
      </div>
    </div>
  );
};

export default AddAdmin;