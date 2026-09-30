export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  studentId?: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  department?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName?: string;
  room?: string;
  schedule?: string;
  enrolledStudentsCount?: number;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  room?: string;
  date: string;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  allowedRadius: number; // in meters
  status: 'open' | 'closed';
  totalExpected?: number;
  totalPresent?: number;
}

export type AttendanceStatus = 'present' | 'late' | 'rejected' | 'absent';

export interface Attendance {
  id: string;
  sessionId: string;
  courseName?: string;
  courseCode?: string;
  room?: string;
  studentId: string;
  studentName?: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  distanceFromClassroom: number; // in meters
  gpsAccuracy: number; // in meters
  photoUrl: string;
  status: AttendanceStatus;
  verificationNotes?: string;
}

export interface AttendanceSubmissionPayload {
  sessionId: string;
  latitude: number;
  longitude: number;
  gpsAccuracy: number;
  photoUri: string; // or base64 / blob
}
