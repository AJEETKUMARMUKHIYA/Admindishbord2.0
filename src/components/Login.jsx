import { useState } from 'react';
import axiosClient from '../AxiosClient';
import { showToast } from './ToastNotification';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // console.log('Attempting login with:', credentials.username);

      // Show loading toast
      // const loadingToast = showToast.loading('Authenticating...');

      let response;
      try {
        // Try endpoint 1
        response = await axiosClient.post("/Auth/Login", {
          firstName: credentials.username,
          password: credentials.password
        });
      } catch (err1) {
        // console.log('First endpoint failed, trying alternative...');
        // Try endpoint 2 (alternative)
        response = await axiosClient.post("/api/Auth/Login", {
          username: credentials.username,
          password: credentials.password
        });
      }

      const data = response.data;
      // console.log('Login successful:', data);

      // Store user data
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('roleId', data.roleId);
      localStorage.setItem('firstName', data.firstName);
      localStorage.setItem('lastName', data.lastName || '');
      localStorage.setItem('email', data.email || '');
      localStorage.setItem('token', data.token || '');

      // Show success toast
      setTimeout(() => {
        showToast.success(`Welcome back, ${data.firstName}!`);
      }, 300);

      // Call onLogin with user data
      setTimeout(() => {
        onLogin({
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          roleId: data.roleId,
          email: data.email
        });
      }, 500);

    } catch (err) {
      console.error('Login error details:', err);

      // Check specific error types
      let errorMessage = 'Login failed. Please try again.';
      let toastMessage = 'Login failed. Please try again.';

      if (err.message.includes('Network Error') || err.code === 'ERR_NETWORK') {
        errorMessage = `Cannot connect to server. Please check:
        1. The backend server is running on http://localhost:7148
        2. CORS is enabled on the backend
        3. You can access the API directly at: ${import.meta.env.VITE_API_BASE_URL}/Auth/Login`;
        toastMessage = 'Cannot connect to server. Please check your connection.';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check the endpoint URL.';
        toastMessage = 'API endpoint not found.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
        toastMessage = 'Server error. Please try again later.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password';
        toastMessage = 'Invalid username or password';
      } else {
        errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
        toastMessage = errorMessage;
      }

      setError(errorMessage);
      showToast.error(toastMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.id]: e.target.value
    });
    if (error) setError('');
  };

  // Test API connection with toast
  const testApiConnection = async () => {
    try {
      setError('Testing API connection...');
      showToast.info('Testing API connection...');

      const response = await axiosClient.get('/');

      const successMessage = `API Connection Successful! Status: ${response.status}`;
      setError(successMessage);
      showToast.success(successMessage);
    } catch (err) {
      const errorMessage = `API Connection Failed: ${err.message}`;
      setError(errorMessage);
      showToast.error(errorMessage);
    }
  };

  return (
    <div id="pyLoginWrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

        #pyLoginWrapper {
          --ink: #0f172a;
          --ink-deep: #090d16;
          --paper: #f8fafc;
          --paper-dim: #f1f5f9;
          --amber: #06b6d4;
          --amber-dark: #0891b2;
          --route: #2563eb;
          --text-main: #0f172a;
          --text-mute: #64748b;
          --danger: #ef4444;

          min-height: 100vh;
          width: 100%;
          display: flex;
          background: var(--ink);
          font-family: 'Inter', sans-serif;
          color: var(--text-main);
        }

        #pyLoginWrapper * { box-sizing: border-box; }

        /* ---------- LEFT: journey / brand panel ---------- */
        #pyLoginWrapper .py-brand {
          position: relative;
          flex: 1.1;
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 15%, rgba(79,187,169,0.16), transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(232,163,61,0.10), transparent 40%),
            linear-gradient(160deg, var(--ink) 0%, var(--ink-deep) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem 3.5rem;
          overflow: hidden;
        }

        #pyLoginWrapper .py-brand-top {
          position: relative;
          z-index: 2;
        }

        #pyLoginWrapper .py-wordmark {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1.75rem;
          color: var(--paper);
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        #pyLoginWrapper .py-wordmark .py-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--amber);
          box-shadow: 0 0 0 4px rgba(232,163,61,0.2);
        }

        #pyLoginWrapper .py-tagline {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(247,243,234,0.45);
          margin-top: 0.6rem;
        }

        #pyLoginWrapper .py-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 2.1rem;
          line-height: 1.25;
          color: var(--paper);
          max-width: 380px;
          margin-top: 3rem;
          letter-spacing: -0.01em;
        }

        #pyLoginWrapper .py-headline span {
          color: var(--amber);
        }

        /* ---------- Route / journey signature element ---------- */
        #pyLoginWrapper .py-route-stage {
          position: relative;
          z-index: 2;
          margin-top: 2.5rem;
          height: 150px;
        }

        #pyLoginWrapper .py-route-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        #pyLoginWrapper .py-route-path {
          fill: none;
          stroke: rgba(79,187,169,0.45);
          stroke-width: 2;
          stroke-dasharray: 6 8;
          stroke-linecap: round;
        }

        #pyLoginWrapper .py-route-pin {
          fill: var(--paper);
        }

        #pyLoginWrapper .py-route-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          fill: rgba(247,243,234,0.55);
          letter-spacing: 0.06em;
        }

        #pyLoginWrapper .py-route-mover {
          animation: py-travel 5.5s ease-in-out infinite;
        }

        @keyframes py-travel {
          0%   { offset-distance: 0%; }
          50%  { offset-distance: 100%; }
          100% { offset-distance: 0%; }
        }

        #pyLoginWrapper .py-route-mover-group {
          offset-path: path('M 8 118 C 90 118, 110 30, 210 30 S 330 118, 392 42');
          animation: py-travel-offset 5.5s ease-in-out infinite;
        }

        @keyframes py-travel-offset {
          0%   { offset-distance: 0%; opacity: 0; }
          6%   { opacity: 1; }
          46%  { opacity: 1; }
          52%  { offset-distance: 100%; opacity: 0; }
          100% { offset-distance: 100%; opacity: 0; }
        }

        #pyLoginWrapper .py-brand-bottom {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 2.5rem;
          font-family: 'JetBrains Mono', monospace;
        }

        #pyLoginWrapper .py-stat b {
          display: block;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.3rem;
          color: var(--paper);
        }

        #pyLoginWrapper .py-stat span {
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(247,243,234,0.4);
        }

        /* ---------- RIGHT: form panel ---------- */
        #pyLoginWrapper .py-form-panel {
          flex: 1;
          min-height: 100vh;
          background: var(--paper);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }

        #pyLoginWrapper .py-card {
          width: 100%;
          max-width: 400px;
          position: relative;
        }

        #pyLoginWrapper .py-card-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-mute);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.6rem;
        }

        #pyLoginWrapper .py-card-eyebrow::before {
          content: '';
          width: 22px;
          height: 1px;
          background: var(--amber-dark);
          display: inline-block;
        }

        #pyLoginWrapper .py-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1.9rem;
          color: var(--text-main);
          letter-spacing: -0.01em;
          margin-bottom: 0.35rem;
        }

        #pyLoginWrapper .py-card-sub {
          font-size: 0.9rem;
          color: var(--text-mute);
          margin-bottom: 2.1rem;
        }

        #pyLoginWrapper .py-alert {
          background: #FBEAE8;
          border: 1px solid #EFC3BE;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          margin-bottom: 1.4rem;
          font-size: 0.83rem;
          color: #8C3128;
        }

        #pyLoginWrapper .py-alert-msg {
          white-space: pre-wrap;
          line-height: 1.5;
        }

        #pyLoginWrapper .py-alert-btn {
          margin-top: 0.6rem;
          background: transparent;
          border: 1px solid #D69A94;
          color: #8C3128;
          border-radius: 6px;
          padding: 0.35rem 0.7rem;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        #pyLoginWrapper .py-alert-btn:hover {
          background: #F5D8D4;
        }

        #pyLoginWrapper .py-field {
          margin-bottom: 1.35rem;
        }

        #pyLoginWrapper .py-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.45rem;
          letter-spacing: 0.01em;
        }

        #pyLoginWrapper .py-input-shell {
          position: relative;
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        #pyLoginWrapper .py-input-shell:focus-within {
          border-color: var(--route);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
        }

        #pyLoginWrapper .py-input-icon {
          padding-left: 0.9rem;
          color: var(--text-mute);
          font-size: 0.85rem;
          display: flex;
        }

        #pyLoginWrapper .py-input {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          padding: 0.85rem 0.9rem;
          font-size: 0.95rem;
          font-family: 'Inter', sans-serif;
          color: var(--text-main);
        }

        #pyLoginWrapper .py-input::placeholder {
          color: #94a3b8;
        }

        #pyLoginWrapper .py-input:disabled {
          opacity: 0.6;
        }

        #pyLoginWrapper .py-eye-btn {
          background: transparent;
          border: none;
          color: var(--text-mute);
          padding: 0 0.9rem;
          cursor: pointer;
          font-size: 0.85rem;
        }

        #pyLoginWrapper .py-submit {
          width: 100%;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
          color: #ffffff;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.98rem;
          padding: 0.95rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          transition: opacity 0.15s ease, transform 0.1s ease;
          margin-top: 0.4rem;
        }

        #pyLoginWrapper .py-submit:hover:not(:disabled) {
          opacity: 0.95;
        }

        #pyLoginWrapper .py-submit:active:not(:disabled) {
          transform: scale(0.99);
        }

        #pyLoginWrapper .py-submit:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
        }

        #pyLoginWrapper .py-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(247,243,234,0.35);
          border-top-color: var(--paper);
          border-radius: 50%;
          animation: py-spin 0.7s linear infinite;
        }

        @keyframes py-spin {
          to { transform: rotate(360deg); }
        }

        #pyLoginWrapper .py-footer {
          margin-top: 1.6rem;
          text-align: center;
        }

        #pyLoginWrapper .py-footer-url {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: var(--text-mute);
          display: block;
          margin-bottom: 0.5rem;
          word-break: break-all;
        }

        #pyLoginWrapper .py-help-btn {
          background: transparent;
          border: 1px solid #DCD3BE;
          color: var(--text-mute);
          border-radius: 8px;
          padding: 0.45rem 0.9rem;
          font-size: 0.78rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        #pyLoginWrapper .py-help-btn:hover {
          border-color: var(--amber-dark);
          color: var(--text-main);
        }

        /* focus visibility for accessibility */
        #pyLoginWrapper button:focus-visible,
        #pyLoginWrapper input:focus-visible {
          outline: 2px solid var(--route);
          outline-offset: 2px;
        }

        /* ---------- Tablet ---------- */
        @media (max-width: 900px) {
          #pyLoginWrapper .py-brand {
            display: none;
          }
          #pyLoginWrapper .py-form-panel {
            flex: 1 1 100%;
          }
        }

        /* ---------- Mobile: compact route banner replaces full brand panel ---------- */
        @media (max-width: 900px) {
          #pyLoginWrapper {
            flex-direction: column;
          }
          #pyLoginWrapper .py-mobile-banner {
            display: flex;
          }
        }

        #pyLoginWrapper .py-mobile-banner {
          display: none;
          background: linear-gradient(160deg, var(--ink) 0%, var(--ink-deep) 100%);
          padding: 1.6rem 1.4rem 1.9rem;
          flex-direction: column;
          gap: 0.2rem;
        }

        #pyLoginWrapper .py-mobile-banner .py-wordmark {
          font-size: 1.3rem;
        }

        #pyLoginWrapper .py-mobile-banner .py-tagline {
          margin-top: 0.3rem;
        }

        @media (max-width: 480px) {
          #pyLoginWrapper .py-form-panel {
            padding: 1.6rem 1.25rem;
            align-items: flex-start;
          }
          #pyLoginWrapper .py-card-title {
            font-size: 1.55rem;
          }
          #pyLoginWrapper .py-card-sub {
            margin-bottom: 1.6rem;
          }
          #pyLoginWrapper .py-input {
            padding: 0.8rem 0.9rem;
            font-size: 1rem;
          }
          #pyLoginWrapper .py-submit {
            padding: 0.9rem 1rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          #pyLoginWrapper .py-route-mover-group {
            animation: none;
            offset-distance: 30%;
          }
          #pyLoginWrapper .py-spinner {
            animation: none;
          }
        }
      `}</style>

      {/* Mobile-only compact brand banner */}
      <div className="py-mobile-banner">
        <div className="py-wordmark"><span className="py-dot" />PackYatra</div>
        <div className="py-tagline">Relocation, tracked end to end</div>
      </div>

      {/* Desktop brand / journey panel */}
      <div className="py-brand">
        <div className="py-brand-top">
          <div className="py-wordmark"><span className="py-dot" />PackYatra</div>
          <div className="py-tagline">Admin Console · Relocation Pvt. Ltd.</div>
          <div className="py-headline">
            Every move is a <span>journey</span> worth tracking.
          </div>
        </div>

        <div className="py-route-stage">
          <svg className="py-route-svg" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid meet">
            <path className="py-route-path" d="M 8 118 C 90 118, 110 30, 210 30 S 330 118, 392 42" />
            <circle className="py-route-pin" cx="8" cy="118" r="5" />
            <text className="py-route-label" x="0" y="138">ORIGIN</text>
            <circle className="py-route-pin" cx="392" cy="42" r="5" />
            <text className="py-route-label" x="358" y="26">DESTINATION</text>
          </svg>
          <div className="py-route-mover-group" style={{ position: 'absolute', top: 0, left: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ transform: 'translate(-7px, -7px)' }}>
              <circle cx="7" cy="7" r="6" fill="#E8A33D" stroke="#0E2A2E" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        <div className="py-brand-bottom">
          <div className="py-stat"><b>2,400+</b><span>Moves Managed</span></div>
          <div className="py-stat"><b>18</b><span>Cities Covered</span></div>
          <div className="py-stat"><b>99.2%</b><span>On-Time Rate</span></div>
        </div>
      </div>

      {/* Form panel */}
      <div className="py-form-panel">
        <div className="py-card">
          <div className="py-card-eyebrow">Admin Access</div>
          <div className="py-card-title">Welcome back</div>
          <div className="py-card-sub">Sign in to manage shipments, crews and routes.</div>

          {error && (
            <div className="py-alert">
              <div className="py-alert-msg">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
              <button type="button" className="py-alert-btn" onClick={testApiConnection}>
                <i className="fas fa-plug"></i> Test API Connection
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="py-field">
              <label className="py-label" htmlFor="username">Username</label>
              <div className="py-input-shell">
                <span className="py-input-icon"><i className="fas fa-user"></i></span>
                <input
                  id="username"
                  className="py-input"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={handleChange}
                  autoFocus
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="py-field">
              <label className="py-label" htmlFor="password">Password</label>
              <div className="py-input-shell">
                <span className="py-input-icon"><i className="fas fa-lock"></i></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="py-input"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="py-eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="py-submit"
              disabled={loading || !credentials.username || !credentials.password}
            >
              {loading ? (
                <>
                  <span className="py-spinner"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Sign in
                </>
              )}
            </button>

            <div className="py-footer">
              <small className="py-footer-url">
                API: {import.meta.env.VITE_API_BASE_URL}
              </small>
              <button
                type="button"
                className="py-help-btn"
                onClick={() => {
                  showToast.info(
                    <div className="toast-help">
                      <div className="toast-help-title">Troubleshooting Tips</div>
                      <div className="toast-help-content">
                        <p>1. Ensure backend is running on port 7148</p>
                        <p>2. Check CORS configuration</p>
                        <p>3. Verify API endpoint paths</p>
                      </div>
                    </div>,
                    {
                      duration: 0,
                      action: {
                        label: 'Got it',
                        onClick: () => {}
                      }
                    }
                  );
                }}
              >
                <i className="fas fa-question-circle"></i> Need help?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
