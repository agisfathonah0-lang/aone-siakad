const API_URL = '/api';

class ApiClient {
  private token: string | null = localStorage.getItem('token');
  private onUnauthorized: (() => void) | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  getToken() { return this.token; }

  setOnUnauthorized(cb: () => void) { this.onUnauthorized = cb; }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, data?: any) {
    return this.request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
  }

  put<T>(path: string, data?: any) {
    return this.request<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (res.status === 401) {
      this.setToken(null);
      this.onUnauthorized?.();
      throw new Error('Sesi berakhir. Silakan login kembali.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  }

  // Auth
  login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  demoLogin(role: string) {
    return this.request<{ user: any; token: string }>('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  getMe() {
    return this.request<any>('/auth/me');
  }

  // Campuses
  getCampuses() { return this.request<any[]>('/campuses'); }
  getCampus(id: string) { return this.request<any>(`/campuses/${id}`); }
  getCampusBySubdomain(subdomain: string) { return this.request<any>(`/campuses/by-subdomain/${subdomain}`); }
  updateCampus(id: string, data: any) {
    return this.request<any>(`/campuses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  getCampusWebSettings(id: string) { return this.request<Record<string, string>>(`/campuses/${id}/web-settings`); }
  updateCampusWebSettings(id: string, settings: Record<string, string>) {
    return this.request<any>(`/campuses/${id}/web-settings`, { method: 'PUT', body: JSON.stringify(settings) });
  }

  // Students
  getStudents() { return this.request<any[]>('/students'); }
  getStudent(id: string) { return this.request<any>(`/students/${id}`); }
  getStudentByNim(nim: string) { return this.request<any>(`/students/nim/${nim}`); }

  // Lecturers
  getLecturers() { return this.request<any[]>('/lecturers'); }
  getLecturer(id: string) { return this.request<any>(`/lecturers/${id}`); }
  createLecturer(data: any) {
    return this.request<any>('/lecturers', { method: 'POST', body: JSON.stringify(data) });
  }
  updateLecturer(id: string, data: any) {
    return this.request<any>(`/lecturers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteLecturer(id: string) {
    return this.request<any>(`/lecturers/${id}`, { method: 'DELETE' });
  }

  // Courses
  getCourses() { return this.request<any[]>('/courses'); }
  getCourse(id: string) { return this.request<any>(`/courses/${id}`); }
  createCourse(data: any) {
    return this.request<any>('/courses', { method: 'POST', body: JSON.stringify(data) });
  }
  updateCourse(id: string, data: any) {
    return this.request<any>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteCourse(id: string) {
    return this.request<any>(`/courses/${id}`, { method: 'DELETE' });
  }

  // Schedules
  getSchedules() { return this.request<any[]>('/schedules'); }
  getSchedule(id: string) { return this.request<any>(`/schedules/${id}`); }
  createSchedule(data: any) {
    return this.request<any>('/schedules', { method: 'POST', body: JSON.stringify(data) });
  }
  updateSchedule(id: string, data: any) {
    return this.request<any>(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteSchedule(id: string) {
    return this.request<any>(`/schedules/${id}`, { method: 'DELETE' });
  }

  // PMB
  getPMBApplicants() { return this.request<any[]>('/pmb'); }
  getPMBApplicant(id: string) { return this.request<any>(`/pmb/${id}`); }
  createPMBApplicant(data: any) {
    return this.request<any>('/pmb', { method: 'POST', body: JSON.stringify(data) });
  }
  updatePMBApplicant(id: string, data: any) {
    return this.request<any>(`/pmb/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Invoices
  getInvoices() { return this.request<any[]>('/invoices'); }
  updateInvoice(id: string, data: any) {
    return this.request<any>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // PDDIKTI
  getSyncLogs() { return this.request<any[]>('/pddikti'); }
  createSyncLog(data: any) {
    return this.request<any>('/pddikti', { method: 'POST', body: JSON.stringify(data) });
  }

  // LMS
  getLMSCourses() { return this.request<any[]>('/lms'); }
  getLMSCourse(id: string) { return this.request<any>(`/lms/${id}`); }

  // OJS
  getOJSJournals() { return this.request<any[]>('/ojs'); }
  getOJSStatus() { return this.request<any>('/ojs/status'); }
  submitOJSManuscript(data: { title: string; abstract: string; author?: string; keywords?: string; journalCategory?: string }) {
    return this.request<any>('/ojs/submissions', { method: 'POST', body: JSON.stringify(data) });
  }

  // Alumni
  getAlumniSurveys() { return this.request<any[]>('/alumni'); }
  getAlumniStats() { return this.request<any>('/alumni/stats'); }

  // Super Admin
  getTickets() { return this.request<any[]>('/admin/tickets'); }
  getAuditLogs() { return this.request<any[]>('/admin/audit-logs'); }
  getCampusStats() { return this.request<any[]>('/admin/campus-stats'); }

  // Lecturer Attendance
  getAttendance(params?: { nip?: string; date?: string; status?: string }) {
    const q = params ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v))).toString() : '';
    return this.request<any[]>(`/attendance${q}`);
  }
  getAttendanceSummary() { return this.request<any>('/attendance/summary'); }
  getAttendanceRekap(month?: string) {
    return this.request<any>(`/attendance/rekap${month ? `?month=${month}` : ''}`);
  }
  checkinAttendance(data: { nip: string; name: string; course?: string; class?: string }) {
    return this.request<any>('/attendance/checkin', { method: 'POST', body: JSON.stringify(data) });
  }
  checkoutAttendance(data: { nip: string }) {
    return this.request<any>('/attendance/checkout', { method: 'POST', body: JSON.stringify(data) });
  }
  updateAttendance(id: string, data: any) {
    return this.request<any>(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Web Settings
  getWebSettings() { return this.request<Record<string, string>>('/web-settings'); }
  updateWebSettings(settings: Record<string, string>) {
    return this.request<any>('/web-settings', { method: 'PUT', body: JSON.stringify(settings) });
  }

  // Firewall
  getFirewallLogs(params?: { type?: string; severity?: string; limit?: number }) {
    const q = params ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString() : '';
    return this.request<any[]>(`/firewall/logs${q}`);
  }
  getFirewallStats() { return this.request<any>('/firewall/stats'); }
  getBlockedIps() { return this.request<any[]>('/firewall/blocked-ips'); }
  blockIp(data: { ip: string; reason?: string; expiresAt?: string }) {
    return this.request<any>('/firewall/block-ip', { method: 'POST', body: JSON.stringify(data) });
  }
  unblockIp(ip: string) {
    return this.request<any>('/firewall/unblock-ip', { method: 'POST', body: JSON.stringify({ ip }) });
  }
}

export const api = new ApiClient();
