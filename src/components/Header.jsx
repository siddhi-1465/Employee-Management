import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, User, CheckCircle, Shield, Menu } from 'lucide-react';

export default function Header({ title, notifications = [], onClearNotifications }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const isAdmin = user?.role === 'admin';

  return (
    <header style={styles.header}>
      {/* Title */}
      <div>
        <h1 style={styles.title}>{title}</h1>
        <span style={styles.subtitle}>
          {isAdmin ? 'Corporate Admin Control Panel' : `Welcome back, ${user?.employee?.full_name || user?.username}`}
        </span>
      </div>

      {/* Right Controls */}
      <div style={styles.controls}>
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme} 
          style={styles.btn}
          className="btn-icon"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications Panel */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            style={styles.btn}
            className="btn-icon"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span style={styles.badge}>{notifications.length}</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={styles.dropdown} className="glass-card">
              <div style={styles.dropdownHeader}>
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Recent Notifications</h4>
                {notifications.length > 0 && (
                  <button onClick={onClearNotifications} style={styles.clearBtn}>
                    Clear
                  </button>
                )}
              </div>
              <div style={styles.dropdownBody}>
                {notifications.length === 0 ? (
                  <p style={styles.emptyText}>No new notifications.</p>
                ) : (
                  notifications.map((notif, idx) => (
                    <div key={idx} style={styles.notifItem}>
                      <div style={styles.notifHeader}>
                        <span style={styles.notifDot}></span>
                        <span style={styles.notifTime}>{notif.time || 'Just now'}</span>
                      </div>
                      <p style={styles.notifText}>{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div style={styles.userCard}>
          <div style={styles.iconBadge}>
            {isAdmin ? <Shield size={14} /> : <User size={14} />}
          </div>
          <span style={styles.roleText}>{user?.role}</span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: '80px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderBottom: 'var(--card-border)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 90,
    marginLeft: 'var(--sidebar-w)',
    transition: 'margin-left 0.3s ease',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  btn: {
    borderRadius: '10px',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: 'var(--danger)',
    color: '#ffffff',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    width: '280px',
    padding: '16px',
    zIndex: 110,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderRadius: 'var(--radius-md)',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    paddingBottom: '8px',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dropdownBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    textAlign: 'center',
    padding: '12px 0',
  },
  notifItem: {
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: '6px',
  },
  notifHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  notifDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
  },
  notifTime: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  notifText: {
    fontSize: '0.78rem',
    color: 'var(--text-main)',
    margin: 0,
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: 'var(--input-bg)',
    borderRadius: 'var(--radius-sm)',
    border: 'var(--input-border)',
  },
  iconBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
};
