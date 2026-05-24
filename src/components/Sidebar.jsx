import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  FileText, 
  History, 
  LogOut, 
  UserCircle, 
  Building2,
  BellRing
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Define tabs based on role
  const tabs = isAdmin 
    ? [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'employees', name: 'Employees', icon: Users },
        { id: 'attendance', name: 'Attendance', icon: CalendarClock },
        { id: 'leaves', name: 'Leave Requests', icon: FileText },
        { id: 'logs', name: 'Activity History', icon: History }
      ]
    : [
        { id: 'overview', name: 'My Dashboard', icon: LayoutDashboard },
        { id: 'profile', name: 'My Profile', icon: UserCircle },
        { id: 'directory', name: 'Co-workers', icon: Users },
        { id: 'leaves', name: 'My Leave requests', icon: FileText }
      ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.brandIconContainer}>
          <Building2 size={22} style={styles.brandIcon} />
        </div>
        <div style={styles.brandInfo}>
          <span style={styles.brandName}>NexisCorp</span>
          <span style={styles.brandTag}>Enterprise Portal</span>
        </div>
      </div>

      {/* User Quick Info */}
      <div style={styles.userProfile}>
        <div style={styles.avatarWrapper}>
          {user?.employee?.profile_image ? (
            <img 
              src={user.employee.profile_image} 
              alt={user.employee.full_name} 
              style={styles.avatarImg}
            />
          ) : (
            <div style={styles.avatarFallback}>
              {isAdmin ? 'AD' : user?.username?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            {isAdmin ? 'System Administrator' : user?.employee?.full_name || user?.username}
          </span>
          <span style={styles.userRole}>
            {isAdmin ? 'Admin Root' : user?.employee?.designation || 'Staff Member'}
          </span>
        </div>
      </div>

      {/* Tabs list (zoom-group handles cursor hover interactions) */}
      <nav style={styles.nav} className="zoom-group">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="zoom-tab"
              style={{
                ...styles.navItem,
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
              }}
            >
              <Icon size={18} style={isActive ? styles.iconActive : styles.iconMuted} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Log out */}
      <div style={styles.footer}>
        <button 
          onClick={logout} 
          style={styles.logoutBtn}
          className="btn-secondary"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-w)',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'var(--card-bg)',
    borderRight: 'var(--card-border)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 100,
    boxShadow: 'var(--glass-shadow)',
    transition: 'var(--transition)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    paddingLeft: '8px',
  },
  brandIconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    color: 'var(--primary)',
  },
  brandInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandName: {
    fontWeight: '800',
    fontSize: '1.2rem',
    letterSpacing: '-0.02em',
  },
  brandTag: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 12px',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '28px',
  },
  avatarWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--primary-light)',
    backgroundColor: 'var(--input-bg)',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  navItem: {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'left',
    transition: 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.3s, opacity 0.25s',
  },
  iconActive: {
    color: 'var(--primary)',
  },
  iconMuted: {
    color: 'var(--text-muted)',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '16px',
  },
  logoutBtn: {
    width: '100%',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
  },
};
