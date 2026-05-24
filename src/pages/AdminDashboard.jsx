import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  DepartmentDistributionChart, 
  EmployeeGrowthChart, 
  UserActivityChart,
  AttendanceRadialWidget 
} from '../components/Charts';
import { 
  Users, 
  UserPlus, 
  CalendarClock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  Edit2, 
  Trash2, 
  Plus, 
  X,
  Camera,
  LogIn,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminDashboard({ activeTab, addNotification }) {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // CRUD Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Loading & error
  const [loading, setLoading] = useState(true);

  // Form states
  const [formEmpId, setFormEmpId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDept, setFormDept] = useState('Engineering');
  const [formDesig, setFormDesig] = useState('');
  const [formSalary, setFormSalary] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formJoinDate, setFormJoinDate] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formImage, setFormImage] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getDashboardStats();
      setStats(statsRes);

      if (activeTab === 'employees') {
        const empRes = await api.getEmployees();
        setEmployees(empRes);
      } else if (activeTab === 'attendance') {
        const attRes = await api.getAttendance();
        setAttendance(attRes);
      } else if (activeTab === 'leaves') {
        const leaveRes = await api.getLeaves();
        setLeaves(leaveRes);
      } else if (activeTab === 'logs') {
        const logsRes = await api.getActivityLogs();
        setLogs(logsRes);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormEmpId(emp.employee_id);
    setFormName(emp.full_name);
    setFormEmail(emp.email);
    setFormPhone(emp.phone_number);
    setFormDept(emp.department);
    setFormDesig(emp.designation);
    setFormSalary(emp.salary);
    setFormAddress(emp.address);
    setFormJoinDate(emp.joining_date);
    setFormStatus(emp.status);
    setFormImage(emp.profile_image || '');
    setFormPassword('');
    setShowEditModal(true);
  };

  const handleOpenAdd = () => {
    setFormEmpId('');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDept('Engineering');
    setFormDesig('');
    setFormSalary('');
    setFormAddress('');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormStatus('Active');
    setFormImage('');
    setFormPassword('');
    setShowAddModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setFormImage(res.url);
      addNotification('Profile image uploaded successfully.');
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.createEmployee({
        employee_id: formEmpId,
        full_name: formName,
        email: formEmail,
        phone_number: formPhone,
        department: formDept,
        designation: formDesig,
        salary: Number(formSalary),
        address: formAddress,
        joining_date: formJoinDate,
        status: formStatus,
        profile_image: formImage,
        password: formPassword || undefined
      });
      setShowAddModal(false);
      addNotification(`New Employee ${formName} created successfully.`);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to create employee');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.updateEmployee(selectedEmployee.employee_id, {
        full_name: formName,
        email: formEmail,
        phone_number: formPhone,
        department: formDept,
        designation: formDesig,
        salary: Number(formSalary),
        address: formAddress,
        joining_date: formJoinDate,
        status: formStatus,
        profile_image: formImage
      });
      setShowEditModal(false);
      addNotification(`Employee ${formName} details updated successfully.`);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} (${id})? This will delete their corresponding user account.`)) return;
    try {
      await api.deleteEmployee(id);
      addNotification(`Employee ${name} record deleted.`);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  const handleReviewLeave = async (id, status) => {
    try {
      await api.reviewLeave(id, status);
      addNotification(`Leave request ${status === 'Approved' ? 'Approved' : 'Rejected'}.`);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to review leave');
    }
  };

  // Export to CSV Handler
  const handleExportCSV = () => {
    if (employees.length === 0) return;
    const headers = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Salary', 'Joining Date', 'Status', 'Address'];
    const rows = employees.map(emp => [
      emp.employee_id,
      emp.full_name,
      emp.email,
      emp.phone_number,
      emp.department,
      emp.designation,
      emp.salary,
      emp.joining_date,
      emp.status,
      emp.address
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NexisCorp_Employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter ? emp.department === deptFilter : true;
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;

    return matchesSearch && matchesDept && matchesStatus;
  });

  if (loading && !stats) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={36} className="pulse" style={{ color: 'var(--primary)' }} />
        <span style={{ marginTop: '12px', fontWeight: '600' }}>Syncing Systems...</span>
      </div>
    );
  }

  return (
    <div style={styles.content} className="fade-in">
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div style={styles.tabContent}>
          {/* Key Indicators Cards Grid */}
          <div className="dashboard-grid">
            <div className="glass-card" style={styles.metricCard}>
              <div style={{ ...styles.cardIconWrapper, backgroundColor: 'rgba(79, 70, 229, 0.12)' }}>
                <Users size={22} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <span style={styles.metricLabel}>Total Staff</span>
                <h2 style={styles.metricVal}>{stats.metrics.totalEmployees}</h2>
              </div>
            </div>

            <div className="glass-card" style={styles.metricCard}>
              <div style={{ ...styles.cardIconWrapper, backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                <CheckCircle size={22} style={{ color: 'var(--success)' }} />
              </div>
              <div>
                <span style={styles.metricLabel}>Active Users</span>
                <h2 style={styles.metricVal}>{stats.metrics.activeEmployees}</h2>
              </div>
            </div>

            <div className="glass-card" style={styles.metricCard}>
              <div style={{ ...styles.cardIconWrapper, backgroundColor: 'rgba(239, 68, 68, 0.12)' }}>
                <XCircle size={22} style={{ color: 'var(--danger)' }} />
              </div>
              <div>
                <span style={styles.metricLabel}>Inactive</span>
                <h2 style={styles.metricVal}>{stats.metrics.inactiveEmployees}</h2>
              </div>
            </div>

            <div className="glass-card" style={styles.metricCard}>
              <div style={{ ...styles.cardIconWrapper, backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
                <LogIn size={22} style={{ color: 'var(--warning)' }} />
              </div>
              <div>
                <span style={styles.metricLabel}>User Logins</span>
                <h2 style={styles.metricVal}>{stats.metrics.newLoginsCount}</h2>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-grid">
            <EmployeeGrowthChart data={stats.employeeGrowth} />
            <DepartmentDistributionChart data={stats.deptDistribution} />
          </div>

          <div className="charts-grid">
            {/* User Activity Trends */}
            <UserActivityChart data={[
              { name: 'Logins', value: stats.metrics.newLoginsCount },
              { name: 'Updates', value: stats.metrics.updatedRecords },
              { name: 'Deletions', value: stats.metrics.deletedRecords }
            ]} />
            
            {/* Attendance Progress Radial */}
            <AttendanceRadialWidget stats={stats.attendanceStats} />
          </div>

          {/* Recent Logs Feed */}
          <div className="glass-card" style={styles.recentLogsCard}>
            <h3 style={styles.sectionTitle}>Recent Core Operations Feed</h3>
            <div style={styles.logsList}>
              {stats.recentActivities.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent logs recorded.</p>
              ) : (
                stats.recentActivities.map((log) => (
                  <div key={log.id} style={styles.logRow}>
                    <div style={styles.logHeader}>
                      <span style={styles.logAction}>{log.action}</span>
                      <span style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div style={styles.logDetails}>
                      <span>Initiated by <strong>{log.username}</strong> ({log.role}) ─ {log.target}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. EMPLOYEES DATABASE TAB */}
      {activeTab === 'employees' && (
        <div style={styles.tabContent}>
          {/* Action Bar */}
          <div style={styles.actionBar}>
            {/* Search */}
            <div style={styles.searchWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by ID, name, email or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                className="glass-input"
              />
            </div>

            {/* Filters */}
            <div style={styles.filterWrapper}>
              <div style={styles.filterItem}>
                <Filter size={16} style={styles.filterIcon} />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  style={styles.selectFilter}
                  className="glass-input"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.selectFilter}
                className="glass-input"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              {/* Add & Export Buttons */}
              <button onClick={handleOpenAdd} className="btn-primary" style={{ padding: '10px 18px' }}>
                <Plus size={16} />
                Add Employee
              </button>

              <button onClick={handleExportCSV} className="btn-secondary" style={{ padding: '10px 16px' }} title="Export as CSV/Excel">
                <FileSpreadsheet size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Database Grid */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No records match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(emp => (
                      <tr key={emp.employee_id}>
                        <td>
                          <div style={styles.tableAvatar}>
                            {emp.profile_image ? (
                              <img src={emp.profile_image} alt={emp.full_name} style={styles.tableAvatarImg} />
                            ) : (
                              <div style={styles.tableAvatarFallback}>{emp.full_name.substring(0, 2).toUpperCase()}</div>
                            )}
                          </div>
                        </td>
                        <td><strong>{emp.employee_id}</strong></td>
                        <td>{emp.full_name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>{emp.designation}</td>
                        <td>${emp.salary?.toLocaleString()}</td>
                        <td>
                          <span className={`badge badge-${emp.status.toLowerCase()}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={styles.actionButtons}>
                            <button 
                              onClick={() => handleOpenEdit(emp)} 
                              style={styles.actionBtn}
                              className="btn-icon"
                              title="Edit Employee details"
                            >
                              <Edit2 size={14} style={{ color: 'var(--primary)' }} />
                            </button>
                            <button 
                              onClick={() => handleDeleteEmployee(emp.employee_id, emp.full_name)} 
                              style={styles.actionBtn}
                              className="btn-icon"
                              title="Delete Record"
                            >
                              <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                            </button>
                          </div>
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

      {/* 3. ATTENDANCE MASTER TAB */}
      {activeTab === 'attendance' && (
        <div style={styles.tabContent}>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    attendance.map(row => (
                      <tr key={row.id}>
                        <td><strong>{row.date}</strong></td>
                        <td>{row.employee_id}</td>
                        <td>{row.full_name}</td>
                        <td>{row.department}</td>
                        <td>{row.designation}</td>
                        <td>{row.clock_in || '─'}</td>
                        <td>{row.clock_out || '─'}</td>
                        <td>
                          <span className={`badge badge-${row.status.toLowerCase()}`}>
                            {row.status}
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

      {/* 4. LEAVE REQUESTS TAB */}
      {activeTab === 'leaves' && (
        <div style={styles.tabContent}>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No leave requests submitted.
                      </td>
                    </tr>
                  ) : (
                    leaves.map(req => (
                      <tr key={req.id}>
                        <td><strong>{req.employee_id}</strong></td>
                        <td>{req.full_name}</td>
                        <td>{req.department}</td>
                        <td>{req.start_date} to {req.end_date}</td>
                        <td>{req.reason}</td>
                        <td><span style={{ fontWeight: '600' }}>{req.type}</span></td>
                        <td>
                          <span className={`badge badge-${req.status.toLowerCase()}`}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {req.status === 'Pending' ? (
                            <div style={styles.actionButtons}>
                              <button 
                                onClick={() => handleReviewLeave(req.id, 'Approved')} 
                                className="btn-icon" 
                                style={{ backgroundColor: 'var(--success-light)', border: 'none' }}
                                title="Approve Request"
                              >
                                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                              </button>
                              <button 
                                onClick={() => handleReviewLeave(req.id, 'Rejected')} 
                                className="btn-icon" 
                                style={{ backgroundColor: 'var(--danger-light)', border: 'none' }}
                                title="Reject Request"
                              >
                                <XCircle size={16} style={{ color: 'var(--danger)' }} />
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Reviewed</span>
                          )}
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

      {/* 5. AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div style={styles.tabContent}>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Operation</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No audit logs available.
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td><strong>{log.username}</strong></td>
                        <td><span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-main)' }}>{log.role}</span></td>
                        <td><span style={{ fontWeight: '600', color: 'var(--primary)' }}>{log.action}</span></td>
                        <td>{log.target}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD EMPLOYEE MODAL --- */}
      {showAddModal && (
        <div style={styles.modalOverlay} className="fade-in">
          <div style={styles.modalContent} className="glass-card fade-in-up">
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Register New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEmployee} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP106"
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
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
                    placeholder="name@corporation.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="glass-input"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Associate Developer"
                    value={formDesig}
                    onChange={(e) => setFormDesig(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Annual Salary ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 85000"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Joining Date</label>
                  <input
                    type="date"
                    value={formJoinDate}
                    onChange={(e) => setFormJoinDate(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Initial Password</label>
                  <input
                    type="password"
                    placeholder="Default: user123"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="glass-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Home Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Profile Picture</label>
                <div style={styles.photoUploadWrapper}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="add-photo-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="add-photo-input" className="btn-secondary" style={{ cursor: 'pointer', gap: '8px' }}>
                    <Camera size={16} />
                    {uploading ? 'Uploading...' : 'Choose Photo'}
                  </label>
                  {formImage && (
                    <img src={formImage} alt="Preview" style={styles.uploadPreview} />
                  )}
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT EMPLOYEE MODAL --- */}
      {showEditModal && (
        <div style={styles.modalOverlay} className="fade-in">
          <div style={styles.modalContent} className="glass-card fade-in-up">
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Modify Employee Details</h3>
              <button onClick={() => setShowEditModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateEmployee} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Employee ID</label>
                  <input
                    type="text"
                    disabled
                    value={formEmpId}
                    className="glass-input"
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)', cursor: 'not-allowed' }}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
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
                    placeholder="name@corporation.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="glass-input"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Associate Developer"
                    value={formDesig}
                    onChange={(e) => setFormDesig(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Annual Salary ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 85000"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Joining Date</label>
                  <input
                    type="date"
                    value={formJoinDate}
                    onChange={(e) => setFormJoinDate(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="glass-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Home Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Profile Picture</label>
                <div style={styles.photoUploadWrapper}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="edit-photo-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="edit-photo-input" className="btn-secondary" style={{ cursor: 'pointer', gap: '8px' }}>
                    <Camera size={16} />
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </label>
                  {formImage && (
                    <img src={formImage} alt="Preview" style={styles.uploadPreview} />
                  )}
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
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
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px',
  },
  cardIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricVal: {
    fontSize: '1.75rem',
    fontWeight: '800',
    marginTop: '4px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '16px',
  },
  recentLogsCard: {
    padding: '24px',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logRow: {
    padding: '12px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  },
  logAction: {
    fontWeight: '700',
    color: 'var(--primary)',
  },
  logTime: {
    color: 'var(--text-muted)',
  },
  logDetails: {
    fontSize: '0.85rem',
    color: 'var(--text-main)',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '280px',
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
  filterWrapper: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  filterIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  selectFilter: {
    paddingLeft: '40px',
    height: '44px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    backgroundColor: 'var(--input-bg)',
    border: 'var(--input-border)',
  },
  tableAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--primary-light)',
    backgroundColor: 'var(--input-bg)',
  },
  tableAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  tableAvatarFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    padding: '6px',
    borderRadius: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '680px',
    padding: '32px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    paddingBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
  photoUploadWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  uploadPreview: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--primary)',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
    borderTop: '1px solid rgba(0,0,0,0.05)',
    paddingTop: '20px',
  },
};
