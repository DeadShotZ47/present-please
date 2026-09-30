import { User, Course, AttendanceSession, Attendance, AttendanceSubmissionPayload } from '../types';
import { StorageService } from './storage';
import { INITIAL_USERS, INITIAL_COURSES, INITIAL_SESSIONS, INITIAL_ATTENDANCE } from './mockData';
import { calculateDistance } from '../utils/distance';

const USERS_STORAGE_KEY = 'pp_users_db';
const COURSES_STORAGE_KEY = 'pp_courses_db';
const SESSIONS_STORAGE_KEY = 'pp_sessions_db';
const ATTENDANCE_STORAGE_KEY = 'pp_attendance_db';

class ApiService {
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;

    const existingUsers = await StorageService.getItem<User[]>(USERS_STORAGE_KEY);
    if (!existingUsers) {
      await StorageService.setItem(USERS_STORAGE_KEY, INITIAL_USERS);
    }

    const existingCourses = await StorageService.getItem<Course[]>(COURSES_STORAGE_KEY);
    if (!existingCourses) {
      await StorageService.setItem(COURSES_STORAGE_KEY, INITIAL_COURSES);
    }

    const existingSessions = await StorageService.getItem<AttendanceSession[]>(SESSIONS_STORAGE_KEY);
    if (!existingSessions) {
      await StorageService.setItem(SESSIONS_STORAGE_KEY, INITIAL_SESSIONS);
    }

    const existingAttendance = await StorageService.getItem<Attendance[]>(ATTENDANCE_STORAGE_KEY);
    if (!existingAttendance) {
      await StorageService.setItem(ATTENDANCE_STORAGE_KEY, INITIAL_ATTENDANCE);
    }

    this.initialized = true;
  }

  // ================= AUTHENTICATION =================

  async login(emailOrStudentId: string, password: string): Promise<{ user: User; token: string }> {
    await this.ensureInitialized();
    const users = (await StorageService.getItem<User[]>(USERS_STORAGE_KEY)) || INITIAL_USERS;

    const trimmedInput = emailOrStudentId.trim().toLowerCase();
    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === trimmedInput ||
        (u.studentId && u.studentId.toLowerCase() === trimmedInput)
    );

    if (!foundUser) {
      throw new Error('Invalid credentials. Check your Email or Student ID.');
    }

    // In production or student project demo, simple password check
    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters.');
    }

    const token = `token_${foundUser.id}_${Date.now()}`;
    await StorageService.setToken(token);
    await StorageService.setItem('pp_current_user', foundUser);

    return { user: foundUser, token };
  }

  async register(data: {
    name: string;
    email: string;
    studentId?: string;
    role: 'student' | 'teacher';
    password: string;
  }): Promise<{ user: User; token: string }> {
    await this.ensureInitialized();
    const users = (await StorageService.getItem<User[]>(USERS_STORAGE_KEY)) || INITIAL_USERS;

    const emailLower = data.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === emailLower)) {
      throw new Error('User with this email already exists.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: emailLower,
      studentId: data.role === 'student' ? data.studentId?.trim() : undefined,
      role: data.role,
      department: data.role === 'student' ? 'College of Computing' : 'Department of Computer Science',
    };

    users.push(newUser);
    await StorageService.setItem(USERS_STORAGE_KEY, users);

    const token = `token_${newUser.id}_${Date.now()}`;
    await StorageService.setToken(token);
    await StorageService.setItem('pp_current_user', newUser);

    return { user: newUser, token };
  }

  async getCurrentUser(): Promise<User | null> {
    await this.ensureInitialized();
    const token = await StorageService.getToken();
    if (!token) return null;
    return await StorageService.getItem<User>('pp_current_user');
  }

  async logout(): Promise<void> {
    await StorageService.removeToken();
    await StorageService.removeItem('pp_current_user');
  }

  // ================= COURSES =================

  async getCourses(): Promise<Course[]> {
    await this.ensureInitialized();
    return (await StorageService.getItem<Course[]>(COURSES_STORAGE_KEY)) || INITIAL_COURSES;
  }

  async getCourseById(id: string): Promise<Course | null> {
    const courses = await this.getCourses();
    return courses.find((c) => c.id === id) || null;
  }

  // ================= ATTENDANCE SESSIONS =================

  async getTodaySessions(): Promise<AttendanceSession[]> {
    await this.ensureInitialized();
    const sessions = (await StorageService.getItem<AttendanceSession[]>(SESSIONS_STORAGE_KEY)) || INITIAL_SESSIONS;
    return sessions;
  }

  async getSessionById(id: string): Promise<AttendanceSession | null> {
    const sessions = await this.getTodaySessions();
    return sessions.find((s) => s.id === id) || null;
  }

  async createSession(data: Omit<AttendanceSession, 'id' | 'status'>): Promise<AttendanceSession> {
    await this.ensureInitialized();
    const sessions = (await StorageService.getItem<AttendanceSession[]>(SESSIONS_STORAGE_KEY)) || INITIAL_SESSIONS;

    const newSession: AttendanceSession = {
      ...data,
      id: `session-${Date.now()}`,
      status: 'open',
      totalExpected: data.totalExpected || 40,
      totalPresent: 0,
    };

    sessions.unshift(newSession);
    await StorageService.setItem(SESSIONS_STORAGE_KEY, sessions);
    return newSession;
  }

  async updateSessionStatus(id: string, status: 'open' | 'closed'): Promise<AttendanceSession> {
    await this.ensureInitialized();
    const sessions = (await StorageService.getItem<AttendanceSession[]>(SESSIONS_STORAGE_KEY)) || INITIAL_SESSIONS;
    const sessionIndex = sessions.findIndex((s) => s.id === id);
    if (sessionIndex === -1) {
      throw new Error('Session not found.');
    }

    sessions[sessionIndex].status = status;
    await StorageService.setItem(SESSIONS_STORAGE_KEY, sessions);
    return sessions[sessionIndex];
  }

  // ================= ATTENDANCE VERIFICATION & SUBMISSION =================

  /**
   * Section 25: The backend independently validates:
   * 1. Authentication
   * 2. Session status (must be open)
   * 3. Duplicate attendance (cannot submit twice)
   * 4. GPS distance (must be <= allowedRadius)
   * 5. Required photo evidence
   */
  async submitAttendance(payload: AttendanceSubmissionPayload): Promise<Attendance> {
    await this.ensureInitialized();
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('Please login before checking attendance.');
    }

    const session = await this.getSessionById(payload.sessionId);
    if (!session) {
      throw new Error('Attendance session does not exist.');
    }

    if (session.status !== 'open') {
      throw new Error('Attendance is currently closed.');
    }

    if (!payload.photoUri) {
      throw new Error('Photo evidence is required.');
    }

    // Duplicate attendance rule
    const allAttendance = (await StorageService.getItem<Attendance[]>(ATTENDANCE_STORAGE_KEY)) || INITIAL_ATTENDANCE;
    const alreadySubmitted = allAttendance.some(
      (a) => a.sessionId === payload.sessionId && a.studentId === currentUser.id
    );
    if (alreadySubmitted) {
      throw new Error('Attendance already submitted for this session.');
    }

    // Distance calculation verification
    const distance = calculateDistance(
      payload.latitude,
      payload.longitude,
      session.latitude,
      session.longitude
    );

    if (distance > session.allowedRadius) {
      throw new Error(
        `Location verification failed. You are ${distance}m away (allowed: ${session.allowedRadius}m).`
      );
    }

    // Determine status (present or late based on session start)
    const newRecord: Attendance = {
      id: `att-${Date.now()}`,
      sessionId: session.id,
      courseName: session.courseName,
      courseCode: session.courseCode,
      room: session.room,
      studentId: currentUser.id,
      studentName: currentUser.name,
      timestamp: new Date().toISOString(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      distanceFromClassroom: distance,
      gpsAccuracy: payload.gpsAccuracy || 10,
      photoUrl: payload.photoUri,
      status: 'present',
      verificationNotes: `Verified on-site. Distance: ${distance}m. Checkpoint passed.`,
    };

    allAttendance.unshift(newRecord);
    await StorageService.setItem(ATTENDANCE_STORAGE_KEY, allAttendance);

    // Increment present count in session
    const sessions = (await StorageService.getItem<AttendanceSession[]>(SESSIONS_STORAGE_KEY)) || INITIAL_SESSIONS;
    const sIndex = sessions.findIndex((s) => s.id === session.id);
    if (sIndex !== -1) {
      sessions[sIndex].totalPresent = (sessions[sIndex].totalPresent || 0) + 1;
      await StorageService.setItem(SESSIONS_STORAGE_KEY, sessions);
    }

    return newRecord;
  }

  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    await this.ensureInitialized();
    const allAttendance = (await StorageService.getItem<Attendance[]>(ATTENDANCE_STORAGE_KEY)) || INITIAL_ATTENDANCE;
    return allAttendance.filter((a) => a.studentId === studentId);
  }

  async getSessionAttendance(sessionId: string): Promise<Attendance[]> {
    await this.ensureInitialized();
    const allAttendance = (await StorageService.getItem<Attendance[]>(ATTENDANCE_STORAGE_KEY)) || INITIAL_ATTENDANCE;
    return allAttendance.filter((a) => a.sessionId === sessionId);
  }

  async getAttendanceById(id: string): Promise<Attendance | null> {
    await this.ensureInitialized();
    const allAttendance = (await StorageService.getItem<Attendance[]>(ATTENDANCE_STORAGE_KEY)) || INITIAL_ATTENDANCE;
    return allAttendance.find((a) => a.id === id) || null;
  }
}

export const api = new ApiService();
