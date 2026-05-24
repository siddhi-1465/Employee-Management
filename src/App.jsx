import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function MainAppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([
    { message: 'Welcome to your NexisCorp workspace!', time: 'Just now' }
  ]);
  const [toast, setToast] = useState(null);

  // Setup periodic stats notifications or default events
  useEffect(() => {
    if (!user) return;
    
    // Clear tabs on user role change
    setActiveTab('overview');

    // Create a mock trigger notification
    const timer = setTimeout(() => {
      if (user.role === 'admin') {
        showToast('System Notice: Check pending leave approvals.');
        setNotifications(prev => [
          { message: 'Notice: Leave requests require admin review.', time: '1m ago' },
          ...prev
        ]);
      } else {
        showToast('Shift Notice: Don\'t forget to log your clock out today.');
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [user]);

  const addNotification = (message) => {
    const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    setNotifications(prev => [
      { message, time: timeStr },
      ...prev
    ]);
    showToast(message);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getTitle = () => {
    if (user?.role === 'admin') {
      switch (activeTab) {
        case 'overview': return 'Executive Analytics Console';
        case 'employees': return 'Employee Database';
        case 'attendance': return 'Master Attendance Logs';
        case 'leaves': return 'Leave Approval Hub';
        case 'logs': return 'Operations Audit Logs';
        default: return 'HR System Control';
      }
    } else {
      switch (activeTab) {
        case 'overview': return 'Employee Portal Home';
        case 'profile': return 'Account Settings';
        case 'directory': return 'Staff Directory';
        case 'leaves': return 'Leave Management Center';
        default: return 'NexisCorp Space';
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.appLoading}>
        <div className="pulse" style={styles.spinner}>NC</div>
        <span style={{ marginTop: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Loading Interface...</span>
      </div>
    );
  }

  // Not logged in: Show Login Screen
  if (!user) {
    return <Login />;
  }

  return (
    <div style={styles.layoutWrapper}>
      {/* Sidebar Panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Top Header Panel */}
      <Header 
        title={getTitle()} 
        notifications={notifications}
        onClearNotifications={clearNotifications}
      />

      {/* Main Body Layout */}
      <main style={styles.mainLayout}>
        {user.role === 'admin' ? (
          <AdminDashboard 
            activeTab={activeTab} 
            addNotification={addNotification} 
          />
        ) : (
          <EmployeeDashboard 
            activeTab={activeTab} 
            addNotification={addNotification} 
          />
        )}
      </main>

      {/* Global Toast Alert */}
      {toast && (
        <div style={styles.toast} className="glass-card fade-in">
          <span style={styles.toastDot}></span>
          <span style={styles.toastText}>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = {
  appLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
  },
  spinner: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  layoutWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  mainLayout: {
    flex: 1,
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderRadius: 'var(--radius-md)',
    zIndex: 10000,
    backgroundColor: 'var(--accent)',
    color: 'var(--bg-color)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
    border: 'none',
  },
  toastDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    flexShrink: 0,
  },
  toastText: {
    fontSize: '0.85rem',
    fontWeight: '600',
  },
};
