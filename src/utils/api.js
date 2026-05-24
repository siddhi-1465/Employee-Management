const API_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Authentication
  async login(username, password, loginType) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, loginType }),
    });
  },

  // Employees CRUD
  async getEmployees() {
    return request('/employees');
  },

  async getEmployeeById(id) {
    return request(`/employees/${id}`);
  },

  async createEmployee(employeeData) {
    return request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  async updateEmployee(id, employeeData) {
    return request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  },

  async deleteEmployee(id) {
    return request(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  // Attendance
  async getAttendance() {
    return request('/attendance');
  },

  async getTodayAttendance() {
    return request('/attendance/today');
  },

  async punchAttendance() {
    return request('/attendance/punch', {
      method: 'POST',
    });
  },

  // Leaves
  async getLeaves() {
    return request('/leaves');
  },

  async submitLeave(leaveData) {
    return request('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  },

  async reviewLeave(id, status) {
    return request(`/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Admin Logs & Stats
  async getDashboardStats() {
    return request('/dashboard/stats');
  },

  async getActivityLogs() {
    return request('/logs');
  },

  // File Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Image upload failed');
    }

    return res.json();
  },
};
