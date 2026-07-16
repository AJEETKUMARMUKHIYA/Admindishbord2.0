import React from 'react';
import { User, Phone, Mail, Lock, Check } from 'lucide-react';

const AddSupervisor = ({ supervisor, onInputChange, onAddSupervisor, isEdit }) => {
  const isFormValid = 
    supervisor.firstName?.trim() &&
    supervisor.lastName?.trim() &&
    supervisor.mobile?.trim() &&
    supervisor.email?.trim() &&
    (isEdit || supervisor.password?.trim());

  return (
    <div style={{ width: '100%' }}>
      <div className="sp-form-grid">
        {/* First Name */}
        <div className="sp-input-group">
          <label htmlFor="firstName">First Name</label>
          <div className="sp-input-wrapper">
            <User size={16} className="sp-input-icon" />
            <input
              required
              type="text"
              id="firstName"
              placeholder="Enter first name"
              value={supervisor.firstName || ''}
              onChange={onInputChange}
              className="sp-input"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="sp-input-group">
          <label htmlFor="lastName">Last Name</label>
          <div className="sp-input-wrapper">
            <User size={16} className="sp-input-icon" />
            <input
              required
              type="text"
              id="lastName"
              placeholder="Enter last name"
              value={supervisor.lastName || ''}
              onChange={onInputChange}
              className="sp-input"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="sp-input-group">
          <label htmlFor="mobile">Mobile Number</label>
          <div className="sp-input-wrapper">
            <Phone size={16} className="sp-input-icon" />
            <input
              required
              type="tel"
              id="mobile"
              placeholder="10-digit number"
              value={supervisor.mobile || ''}
              onChange={onInputChange}
              className="sp-input"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="sp-input-group">
          <label htmlFor="email">Email Address</label>
          <div className="sp-input-wrapper">
            <Mail size={16} className="sp-input-icon" />
            <input
              required
              type="email"
              id="email"
              placeholder="name@example.com"
              value={supervisor.email || ''}
              onChange={onInputChange}
              className="sp-input"
            />
          </div>
        </div>

        {/* Password (only if not editing) */}
        {!isEdit && (
          <div className="sp-input-group sp-form-span-2">
            <label htmlFor="password">Password</label>
            <div className="sp-input-wrapper">
              <Lock size={16} className="sp-input-icon" />
              <input
                required
                type="password"
                id="password"
                placeholder="Create strong password"
                value={supervisor.password || ''}
                onChange={onInputChange}
                className="sp-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Submit Button */}
      <div style={{ marginTop: '24px' }}>
        <button
          type="button"
          onClick={onAddSupervisor}
          disabled={!isFormValid}
          className="sp-btn sp-btn--solid"
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          <Check size={16} />
          <span>{isEdit ? 'Save Changes' : 'Register Supervisor'}</span>
        </button>
      </div>
    </div>
  );
};

export default AddSupervisor;
