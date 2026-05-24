import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  FileText, 
  Send,
  Plus,
  Search,
  Camera,
  CheckCircle,
  XCircle,
  Loader,
  DollarSign
} from 'lucide-react';

export default function EmployeeDashboard({ activeTab, addNotification }) {
  const { user, updateLocalEmployee } = useAuth();
  const employee = user?.employee;

  // General States
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [directory, setDirectory] = useState([]);
  
  // Search state for coworkers
  const [searchQuery, setSearchQuery] = useState('');

  // Loading states
  const [punching, setPunching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Leave Form state
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveType, setLeaveType] = useState('Annual');
  const [leaveReason, setLeaveReason] = useState('');

  // Edit Profile Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formImage, setFormImage] = useState('');

  useEffect(() => {
    fetchEmployeeData();
  }, [activeTab]);

  const fetchEmployeeData = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const attToday = await api.getTodayAttendance();
        setTodayAttendance(attToday);
        const leaveRes = await api.getLeaves();
        setMyLeaves(leaveRes);
      } else if (activeTab === 'profile') {
        // Initialize profile form
        setFormName(employee.full_name || '');
        setFormEmail(employee.email || '');
        setFormPhone(employee.phone_number || '');
        setFormAddress(employee.address || '');
        setFormImage(employee.profile_image || '');
      } else if (activeTab === 'directory') {
        const dirRes = await api.getEmployees();
        setDirectory(dirRes);
      } else if (activeTab === 'leaves') {
        const leaveRes = await api.getLeaves();
        setMyLeaves(leaveRes);
      }
    } catch (err) {
      console.error('Error fetching employee dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clock in / out punch operation
  const handlePunch = async () => {
    setPunching(true);
    try {
      const res = await api.punchAttendance();
      addNotification(res.message);
      // Refresh status
      const attToday = await api.getTodayAttendance();
      setTodayAttendance(attToday);
    } catch (err) {
      alert(err.message || 'Clock operation failed.');
    } finally {
      setPunching(false);
    }
  };

  // Submit Leave request
  const handleRequestLeave = async (e) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      await api.submitLeave({
        start_date: leaveStart,
        end_date: leaveEnd,
        reason: leaveReason,
        type: leaveType
      });
      addNotification(`Leave request submitted successfully.`);
      // Reset form
      setLeaveStart('');
      setLeaveEnd('');
      setLeaveReason('');
      // Refresh list
      const leaveRes = await api.getLeaves();
      setMyLeaves(leaveRes);
    } catch (err) {
      alert(err.message || 'Failed to submit leave request');
    }
  };

  // Save changes to profile details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateEmployee(employee.employee_id, {
        full_name: formName,
        email: formEmail,
        phone_number: formPhone,
        address: formAddress,
        profile_image: formImage
      });
      // Sync auth context local storage
      updateLocalEmployee(updated);
      addNotification('Your profile details have been saved.');
    } catch (err) {
      alert(err.message || 'Failed to save profile changes');
    }
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setFormImage(res.url);
      addNotification('New profile picture uploaded.');
    } catch (err) {
      alert(err.message || 'Profile photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Filter Directory
  const filteredDirectory = directory.filter(emp => 
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !todayAttendance && directory.length === 0 && myLeaves.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size={36} className="spin" style={{ color: 'var(--primary)' }} />
        <span style={{ marginTop: '12px', fontWeight: '600' }}>Loading WorkSpace...</span>
      </div>
    );
  }

  return (
    <div style={styles.content} className="fade-in">
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={styles.tabContent}>
          <div style={styles.dashboardGrid}>
            
            {/* Punch Widget Card */}
            <div className="glass-card" style={styles.punchCard}>
              <div style={styles.punchHeader}>
                <Clock size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={styles.cardTitle}>Shift Attendance Tracker</h3>
              </div>
              <p style={styles.punchDate}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              
              <div style={styles.punchClockBox}>
                <span style={styles.punchClockLabel}>Current Status</span>
                <h4 style={{
                  ...styles.punchStatusText,
                  color: todayAttendance ? 'var(--success)' : 'var(--text-muted)'
                }}>
                  {todayAttendance 
                    ? (todayAttendance.clock_out ? 'Shift Completed' : `Clocked In (${todayAttendance.clock_in})`)
                    : 'Not Clocked In'}
                </h4>
              </div>

              <button
                onClick={handlePunch}
                disabled={punching || (todayAttendance && todayAttendance.clock_out)}
                className="btn-primary"
                style={{
                  ...styles.punchBtn,
                  backgroundColor: todayAttendance 
                    ? (todayAttendance.clock_out ? 'var(--text-muted)' : 'var(--danger)')
                    : 'var(--success)'
                }}
              >
                {punching ? 'Syncing...' : (
                  todayAttendance 
                    ? (todayAttendance.clock_out ? 'Done for Today' : 'Clock Out')
                    : 'Clock In'
                )}
              </button>

              {todayAttendance && (
                <div style={styles.punchSummary}>
                  <div style={styles.summaryItem}>
                    <span>Clock In:</span>
                    <strong>{todayAttendance.clock_in}</strong>
                  </div>
                  <div style={styles.summaryItem}>
                    <span>Clock Out:</span>
                    <strong>{todayAttendance.clock_out || 'Active'}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info Summary Card */}
            <div className="glass-card" style={styles.profileSummaryCard}>
              <div style={styles.profileCardHeader}>
                <div style={styles.profileAvatar}>
                  {employee?.profile_image ? (
                    <img src={employee.profile_image} alt={employee.full_name} style={styles.avatarImg} />
                  ) : (
                    <div style={styles.avatarFallback}>{employee?.full_name?.substring(0, 2).toUpperCase()}</div>
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>{employee?.full_name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{employee?.designation} ({employee?.department})</span>
                </div>
              </div>

              <div style={styles.infoLines}>
                <div style={styles.infoLine}>
                  <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                  <span>{employee?.email}</span>
                </div>
                <div style={styles.infoLine}>
                  <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                  <span>{employee?.phone_number || '─'}</span>
                </div>
                <div style={styles.infoLine}>
                  <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                  <span>{employee?.address || '─'}</span>
                </div>
                <div style={styles.infoLine}>
                  <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                  <span>Joined on {employee?.joining_date}</span>
                </div>
                <div style={styles.infoLine}>
                  <DollarSign size={16} style={{ color: 'var(--text-muted)' }} />
                  <span>Salary Rate: <span style={{ fontWeight: '600' }}>${employee?.salary?.toLocaleString()}/yr</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Leave History */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ ...styles.cardTitle, marginBottom: '16px' }}>Leave Requests History</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                        No leave records found.
                      </td>
                    </tr>
                  ) : (
                    myLeaves.slice(0, 5).map(req => (
                      <tr key={req.id}>
                        <td><strong>{req.type}</strong></td>
                        <td>{req.start_date}</td>
                        <td>{req.end_date}</td>
                        <td>{req.reason}</td>
                        <td>
                          <span className={`badge badge-${req.status.toLowerCase()}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. UPDATE PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={styles.tabContent}>
          <div className="glass-card" style={{ maxWidth: '640px', padding: '32px' }}>
            <h3 style={{ ...styles.cardTitle, marginBottom: '24px' }}>Update Personal Information</h3>

            <form onSubmit={handleUpdateProfile} style={styles.form}>
              <div style={styles.photoUploadSection}>
                <div style={styles.profileAvatarBig}>
                  {formImage ? (
                    <img src={formImage} alt="Profile" style={styles.avatarImg} />
                  ) : (
                    <div style={styles.avatarFallbackBig}>{formName?.substring(0, 2).toUpperCase()}</div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    id="profile-photo-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profile-photo-input" className="btn-secondary" style={{ cursor: 'pointer', gap: '8px' }}>
                    <Camera size={16} />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Supports PNG, JPG, GIF files. Max size 2MB.
                  </p>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Corporate ID</label>
                  <input
                    type="text"
                    disabled
                    value={employee?.employee_id}
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)', cursor: 'not-allowed' }}
                    className="glass-input"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Home Address</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="glass-input"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
                Save Profile Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. CO-WORKERS DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div style={styles.tabContent}>
          {/* Action Bar */}
          <div style={styles.actionBar}>
            <div style={styles.searchWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search coworker by name, department, designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
                className="glass-input"
              />
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div style={styles.directoryGrid}>
            {filteredDirectory.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                No colleagues found matching your search.
              </div>
            ) : (
              filteredDirectory.map(emp => (
                <div key={emp.employee_id} className="glass-card" style={styles.colleagueCard}>
                  <div style={styles.colleagueHeader}>
                    <div style={styles.colleagueAvatar}>
                      {emp.profile_image ? (
                        <img src={emp.profile_image} alt={emp.full_name} style={styles.avatarImg} />
                      ) : (
                        <div style={styles.avatarFallback}>{emp.full_name.substring(0, 2).toUpperCase()}</div>
                      )}
                    </div>
                    <span className={`badge badge-${emp.status.toLowerCase()}`} style={{ alignSelf: 'flex-start' }}>
                      {emp.status}
                    </span>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{emp.full_name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{emp.designation}</p>
                    <span style={styles.colleagueDept}>{emp.department}</span>
                  </div>

                  <div style={styles.colleagueContact}>
                    <div style={styles.contactLine}>
                      <Mail size={13} style={{ color: 'var(--primary)' }} />
                      <a href={`mailto:${emp.email}`} style={{ color: 'inherit' }}>{emp.email}</a>
                    </div>
                    {emp.phone_number && (
                      <div style={styles.contactLine}>
                        <Phone size={13} style={{ color: 'var(--primary)' }} />
                        <span>{emp.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. LEAVE SUBMISSION TAB */}
      {activeTab === 'leaves' && (
        <div style={styles.tabContent}>
          <div style={styles.leavesLayout}>
            {/* Request Form */}
            <div className="glass-card" style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{ ...styles.cardTitle, marginBottom: '20px' }}>File Leave Application</h3>
              <form onSubmit={handleRequestLeave} style={styles.form}>
                
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Start Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="glass-input"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>End Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="glass-input"
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Leave Classification</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="glass-input"
                  >
                    <option value="Annual">Annual Leave (Vacation)</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Unpaid">Unpaid Personal Leave</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Detailed Reason *</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Provide context regarding your request..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="glass-input"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', gap: '8px' }}>
                  <Send size={16} />
                  Submit Request
                </button>
              </form>
            </div>

            {/* Submissions History Grid */}
            <div className="glass-card" style={{ flex: 2, minWidth: '320px' }}>
              <h3 style={{ ...styles.cardTitle, marginBottom: '16px' }}>All Submitted Requests</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No leave applications recorded.
                        </td>
                      </tr>
                    ) : (
                      myLeaves.map(req => (
                        <tr key={req.id}>
                          <td><strong>{req.type}</strong></td>
                          <td>{req.start_date} to {req.end_date}</td>
                          <td>{req.reason}</td>
                          <td>
                            <span className={`badge badge-${req.status.toLowerCase()}`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loadingContainer: {
    marginLeft: 'var(--sidebar-w)',
    height: 'calc(100vh - 80px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginLeft: 'var(--sidebar-w)',
    padding: '32px',
    minHeight: 'calc(100vh - 80px)',
    transition: 'margin-left 0.3s ease',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  punchCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '28px',
  },
  punchHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '700',
  },
  punchDate: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  punchClockBox: {
    textAlign: 'center',
    margin: '24px 0',
    padding: '16px',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 'var(--radius-md)',
  },
  punchClockLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  punchStatusText: {
    fontSize: '1.35rem',
    fontWeight: '800',
    marginTop: '6px',
  },
  punchBtn: {
    width: '100%',
    justifyContent: 'center',
    border: 'none',
  },
  punchSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(0,0,0,0.05)',
    fontSize: '0.85rem',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileSummaryCard: {
    padding: '28px',
  },
  profileCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  profileAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--primary-light)',
    backgroundColor: 'var(--input-bg)',
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
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  infoLines: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.85rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  photoUploadSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '8px',
  },
  profileAvatarBig: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid var(--primary-light)',
    backgroundColor: 'var(--input-bg)',
  },
  avatarFallbackBig: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '480px',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: '48px',
  },
  directoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },
  colleagueCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  colleagueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colleagueAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--primary-light)',
    backgroundColor: 'var(--input-bg)',
  },
  colleagueDept: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    padding: '2px 8px',
    borderRadius: '4px',
    marginTop: '6px',
  },
  colleagueContact: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  contactLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  leavesLayout: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
};
