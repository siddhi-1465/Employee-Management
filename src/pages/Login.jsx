import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { Shield, User, Lock, Sun, Moon, Sparkles, Building2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'employee'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(username, password, loginType);
      login(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (type) => {
    setLoginType(type);
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div style={styles.container} className="fade-in">
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme} 
        style={styles.themeToggle} 
        className="btn-icon"
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Main Login Card */}
      <div style={styles.card} className="glass-card fade-in-up">
        
        {/* Brand Header */}
        <div style={styles.brandContainer}>
          <div style={styles.brandIconContainer}>
            <Building2 size={28} style={styles.brandIcon} />
          </div>
          <h2 style={styles.brandTitle}>NexisCorp</h2>
          <p style={styles.brandSubtitle}>Human Resource Operations Hub</p>
        </div>

        {/* Tab Selection (Sliding Tab Zoom Interaction) */}
        <div style={styles.tabContainer} className="zoom-group">
          <button
            onClick={() => handleTabChange('admin')}
            className="zoom-tab"
            style={{
              ...styles.tabButton,
              backgroundColor: loginType === 'admin' ? 'var(--primary)' : 'transparent',
              color: loginType === 'admin' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: loginType === 'admin' ? '600' : '500',
            }}
          >
            <Shield size={16} />
            Admin Portal
          </button>
          <button
            onClick={() => handleTabChange('employee')}
            className="zoom-tab"
            style={{
              ...styles.tabButton,
              backgroundColor: loginType === 'employee' ? 'var(--primary)' : 'transparent',
              color: loginType === 'employee' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: loginType === 'employee' ? '600' : '500',
            }}
          >
            <User size={16} />
            Employee Space
          </button>
        </div>

        {/* Informational Message */}
        <div style={styles.portalInfo}>
          <Sparkles size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>
            {loginType === 'admin' 
              ? 'Admin access grants full analytics, logs, and employee CRUD controls.' 
              : 'Sign in with your Employee ID (e.g. EMP101) to punch attendance, request leaves, or edit details.'}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              {loginType === 'admin' ? 'Admin Username' : 'Employee ID'}
            </label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder={loginType === 'admin' ? 'Enter admin username...' : 'e.g. EMP101'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                className="glass-input"
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                className="glass-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={styles.submitBtn}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Portal Footer */}
        <div style={styles.footer}>
          <span>Secured with Industry JWT Standards</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    position: 'relative',
  },
  themeToggle: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    padding: '10px',
    borderRadius: 'var(--radius-md)',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  brandContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  brandIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  brandIcon: {
    color: 'var(--primary)',
  },
  brandTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.025em',
  },
  brandSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 'var(--radius-md)',
    padding: '4px',
  },
  tabButton: {
    flex: 1,
    border: 'none',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  portalInfo: {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    backgroundColor: 'var(--primary-light)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.78rem',
    color: 'var(--text-main)',
    lineHeight: '1.4',
  },
  errorBox: {
    padding: '12px',
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: '500',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.15)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  input: {
    paddingLeft: '48px',
  },
  submitBtn: {
    justifyContent: 'center',
    marginTop: '8px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '8px',
  },
};
