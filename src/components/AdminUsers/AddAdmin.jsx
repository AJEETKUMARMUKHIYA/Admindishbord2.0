import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  UserPlus, 
  ShieldAlert,
  Info
} from 'lucide-react';

const AddAdmin = ({ admin, onInputChange, onAddAdmin }) => {
  return (
    <div id="addAdminContainer">
      <style>{`
        #addAdminContainer {
          font-family: 'Inter', sans-serif;
          color: #0f172a;
          background: #ffffff;
        }

        .formal-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #2563eb;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .formal-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .formal-subtitle {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }

        .form-span-2 {
          grid-column: span 2;
        }

        @media (max-width: 640px) {
          .form-span-2 {
            grid-column: span 1;
          }
        }

        /* Input styling with icons */
        .formal-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .formal-label {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .formal-label .required {
          color: #ef4444;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .formal-input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          color: #0f172a;
          background-color: #ffffff;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }

        .formal-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          outline: none;
        }

        .formal-input::placeholder {
          color: #94a3b8;
        }

        .field-hint {
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Action Row */
        .action-row {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .btn-formal-primary {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
          border: none;
          border-radius: 8px;
          padding: 11px 24px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.18);
        }

        .btn-formal-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
          opacity: 0.95;
        }

        .btn-formal-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-formal-primary:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
        }

        /* Compliance Box */
        .compliance-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .compliance-text {
          font-size: 11.5px;
          color: #475569;
          line-height: 1.4;
          margin: 0;
        }
      `}</style>

      {/* Header Info */}
      <div className="formal-eyebrow">
        <ShieldAlert size={12} /> ADMINISTRATIVE PROVISIONING ENGINE
      </div>
      <h3 className="formal-title">Provision Administrative Account</h3>
      <p className="formal-subtitle">
        Enter the operator credentials below to register a secure administrator profile. 
        All fields are strictly required for validation and network security.
      </p>

      {/* Form Fields */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-grid">
          
          {/* First Name */}
          <div className="formal-field">
            <label htmlFor="firstName" className="formal-label">
              First Name <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><User size={15} /></span>
              <input
                id="firstName"
                type="text"
                className="formal-input"
                placeholder="e.g. Rajesh"
                value={admin.firstName || ''}
                onChange={onInputChange}
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="formal-field">
            <label htmlFor="lastName" className="formal-label">
              Last Name <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><User size={15} /></span>
              <input
                id="lastName"
                type="text"
                className="formal-input"
                placeholder="e.g. Kumar"
                value={admin.lastName || ''}
                onChange={onInputChange}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="formal-field">
            <label htmlFor="email" className="formal-label">
              Corporate Email Address <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Mail size={15} /></span>
              <input
                id="email"
                type="email"
                className="formal-input"
                placeholder="e.g. rajesh.kumar@packyatra.com"
                value={admin.email || ''}
                onChange={onInputChange}
                required
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="formal-field">
            <label htmlFor="mobile" className="formal-label">
              Contact Phone Number <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Phone size={15} /></span>
              <input
                id="mobile"
                type="tel"
                className="formal-input"
                placeholder="e.g. 9876543210"
                value={admin.mobile || ''}
                onChange={onInputChange}
                required
              />
            </div>
          </div>

          {/* Temporary Password */}
          <div className="formal-field form-span-2">
            <label htmlFor="password" className="formal-label">
              Initial Security Password <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Lock size={15} /></span>
              <input
                id="password"
                type="password"
                className="formal-input"
                placeholder="Initialize a strong, unique password"
                value={admin.password || ''}
                onChange={onInputChange}
                required
              />
            </div>
            <div className="field-hint">
              <Info size={11} style={{ color: '#2563eb' }} />
              <span>Provide at least 8 characters. The user is required to reset this credential upon first successful authentication.</span>
            </div>
          </div>
        </div>

        {/* Action and Compliance Row */}
        <div className="action-row">
          <div className="compliance-box">
            <Info size={16} style={{ color: '#475569', flexShrink: 0, marginTop: 1 }} />
            <p className="compliance-text">
              By confirming this operation, you assign full read, write, and dispatch permissions on this workspace. Ensure you verify the identity and clearances of the operator prior to submission.
            </p>
          </div>

          <button
            type="button"
            className="btn-formal-primary"
            onClick={onAddAdmin}
            disabled={
              !admin.firstName?.trim() ||
              !admin.lastName?.trim() ||
              !admin.mobile?.trim() ||
              !admin.email?.trim() ||
              !admin.password?.trim()
            }
          >
            <UserPlus size={16} />
            Provision Administrator Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAdmin;
