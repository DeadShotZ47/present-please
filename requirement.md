# Present, Please.

## Attendance Verification Mobile Application

> A React Native mobile application for student attendance verification using **photo evidence, GPS location, authentication, and attendance records**.

---

# 1. Project Overview

**Present, Please.** is a mobile attendance application designed for educational institutions.

The application allows students to check in to classes by providing:

1. Student authentication
2. Current GPS location
3. Photo evidence
4. Current date and time

The system verifies whether the student is physically within the designated classroom area before accepting the attendance record.


---

# 2. Project Goals

The application should demonstrate:

* React Native fundamentals
* TypeScript
* Component-based UI
* Props and State
* Styling and responsive UI
* Navigation
* Forms
* REST API communication
* Local storage
* Authentication
* Camera
* Location / GPS
* Notifications
* Performance
* Accessibility
* Clean application architecture

---

# 3. Technology Stack

## Mobile Application

* React Native
* Expo
* TypeScript
* Expo Router

## Expo Libraries

Use Expo-compatible libraries where appropriate:

* `expo-camera`
* `expo-location`
* `expo-image-picker`
* `expo-notifications`
* `expo-secure-store`
* `@react-native-async-storage/async-storage`

## Backend

Use a REST API.

Recommended:

* Node.js
* Express
* TypeScript

## Database

Recommended:

* PostgreSQL

The backend should expose REST endpoints for:

* Authentication
* Users
* Courses
* Class sessions
* Attendance
* Attendance history

---

# 4. User Roles

The application has two primary roles.

## Student

Students can:

* Login
* View enrolled courses
* View today's classes
* Check attendance
* Take attendance photo
* Share current location
* View attendance history
* View attendance status

## Teacher

Teachers can:

* Login
* View their courses
* Create/open class sessions
* Define classroom location
* Set attendance time window
* View student attendance
* View attendance evidence

---

# 5. Core Attendance Concept

The main feature of the application is:

> **Proof of Presence**

A student must provide multiple pieces of information to prove attendance.

```text
Student
   │
   ├── Authentication
   │
   ├── Current Location
   │
   ├── Photo Evidence
   │
   └── Current Time
          │
          ▼
    Attendance Verification
          │
     ┌────┴────┐
     │         │
   PASS      FAIL
     │         │
     ▼         ▼
 Present    Rejected
```

---

# 6. Attendance Verification Rules

An attendance request should only be accepted when all required conditions are satisfied.

## Rule 1 — Authentication

The student must be logged in.

If not authenticated:

```text
Please login before checking attendance.
```

---

## Rule 2 — Attendance Session

There must be an active class session.

Example:

```text
Mobile Application Development

09:00 - 12:00

Attendance:
OPEN
```

If the session is closed:

```text
Attendance is currently closed.
```

---

## Rule 3 — Location

The application retrieves the student's current GPS coordinates.

The class session contains:

```text
latitude
longitude
allowedRadius
```

Example:

```text
Classroom Location

Latitude: 16.xxxxx
Longitude: 102.xxxxx
Radius: 50 meters
```

Calculate the distance between:

```text
Student Location
        ↓
Classroom Location
```

If:

```text
distance <= allowedRadius
```

the location passes.

Otherwise:

```text
You are outside the attendance area.
```

---

## Rule 4 — Photo Evidence

The student must take a photo using the device camera.

The application should show:

```text
Take Attendance Photo

[ Camera Preview ]

[ Retake ] [ Use Photo ]
```

The photo must be uploaded together with the attendance request.

---

## Rule 5 — Duplicate Attendance

A student cannot check in to the same class session more than once.

If already checked:

```text
Attendance already submitted.
```

---

# 7. Main Application Screens

## 7.1 Splash Screen

Display:

```text
PRESENT, PLEASE.

Verify your presence.
```

Then determine whether the user is authenticated.

---

# 8. Login Screen

Elements:

```text
PRESENT, PLEASE.

Email / Student ID
[________________]

Password
[________________]

[ LOGIN ]

Don't have an account?
Register
```

Requirements:

* Form validation
* Password hidden by default
* Show/hide password
* Loading state
* Error message
* API authentication

---

# 9. Student Home

The home screen should show:

```text
Good morning, Student.

Today's Classes

┌─────────────────────────────┐
│ Mobile Application          │
│ 09:00 - 12:00               │
│ Room 301                    │
│                             │
│ [ CHECK ATTENDANCE ]        │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Database Systems            │
│ 13:00 - 16:00               │
│ Room 402                    │
│                             │
│ Attendance: NOT OPEN        │
└─────────────────────────────┘
```

Bottom navigation:

```text
Home
Classes
History
Profile
```

---

# 10. Attendance Screen

This is the main feature.

Display:

```text
ATTENDANCE

Mobile Application Development

09:00 - 12:00
Room 301

Step 1
Location

[ CHECK LOCATION ]

Step 2
Photo Evidence

[ TAKE PHOTO ]

Step 3
Submit

[ SUBMIT ATTENDANCE ]
```

The user should not be able to submit until all required information has been collected.

---

# 11. Location Verification UI

After requesting GPS:

```text
Checking your location...

GPS Accuracy: 8m

Distance from classroom:
23m

✓ Location verified
```

If outside the area:

```text
✕ Location verification failed

You are approximately 127m
away from the classroom.

Allowed distance: 50m
```

The application should provide a retry button.

---

# 12. Camera Screen

Use the device camera.

Requirements:

* Camera preview
* Capture button
* Retake
* Confirm photo
* Permission handling

Example:

```text
PHOTO EVIDENCE

[ CAMERA PREVIEW ]

          ( ● )

[ RETAKE ]       [ USE PHOTO ]
```

Do not require advanced image recognition for the first version.

---

# 13. Attendance Confirmation

Before submission, show a summary.

```text
CONFIRM ATTENDANCE

Course
Mobile Application Development

Time
09:04

Location
23m from classroom

Photo
[ PHOTO PREVIEW ]

Status
✓ Location verified
✓ Photo attached
✓ Attendance session open

[ SUBMIT ATTENDANCE ]
```

---

# 14. Attendance Success

After successful submission:

```text
✓ ATTENDANCE VERIFIED

Mobile Application Development

09:04
Room 301

Location verified
Photo submitted

Attendance status:
PRESENT

[ BACK TO HOME ]
```

---

# 15. Attendance History

Display previous attendance.

Example:

```text
ATTENDANCE HISTORY

September 2026

Mobile Application
✓ Present
09:04

Database Systems
✓ Present
13:02

Computer Networks
✕ Absent

Software Engineering
L Late
09:17
```

Use a list component.

Include:

* Course
* Date
* Time
* Status
* Location verification status

---

# 16. Attendance Detail

When selecting a history item:

```text
ATTENDANCE DETAIL

Course
Mobile Application Development

Date
30 September 2026

Time
09:04

Status
PRESENT

Location
23 meters from classroom

GPS Accuracy
8 meters

Evidence Photo
[ PHOTO ]

Submitted at
09:04:32
```

---

# 17. Teacher Dashboard

Teacher home:

```text
TEACHER DASHBOARD

Today's Classes

Mobile Application Development
09:00 - 12:00

Attendance
34 / 40

[ OPEN SESSION ]

[ VIEW ATTENDANCE ]
```

---

# 18. Teacher — Create Attendance Session

Teacher can define:

```text
Course
[ Mobile Application Development ]

Date
[ 30/09/2026 ]

Start Time
[ 09:00 ]

End Time
[ 12:00 ]

Classroom Latitude
[ ........ ]

Classroom Longitude
[ ........ ]

Allowed Radius
[ 50 meters ]

[ CREATE SESSION ]
```

For usability, allow the teacher to use their current location as the classroom location.

---

# 19. Teacher — Attendance List

Display:

```text
MOBILE APPLICATION DEVELOPMENT

Present: 34 / 40

Student          Time       Status

John             09:01      ✓ Present
Alice            09:03      ✓ Present
Bob              --         ✕ Absent
Charlie          09:12      L Late
```

Teacher can open an attendance record to see:

* Student
* Time
* Location
* Distance
* Evidence photo

---

# 20. Profile

Student profile:

```text
PROFILE

[ Profile Photo ]

John Doe

Student ID
6501234567

Email
john@example.com

Role
Student

[ LOGOUT ]
```

Teacher profile should use the same general structure.

---

# 21. Navigation

Use Expo Router.

Recommended structure:

```text
app/
├── _layout.tsx
├── index.tsx
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
│
├── (student)/
│   ├── _layout.tsx
│   ├── home.tsx
│   ├── classes.tsx
│   ├── history.tsx
│   ├── profile.tsx
│   ├── attendance/
│   │   ├── [sessionId].tsx
│   │   ├── location.tsx
│   │   ├── camera.tsx
│   │   └── confirm.tsx
│   └── attendance-detail/
│       └── [attendanceId].tsx
│
└── (teacher)/
    ├── _layout.tsx
    ├── home.tsx
    ├── sessions.tsx
    ├── create-session.tsx
    ├── attendance/
    │   └── [sessionId].tsx
    └── profile.tsx
```

---

# 22. Component Architecture

Create reusable components.

Example:

```text
components/
├── AttendanceCard.tsx
├── CourseCard.tsx
├── StatusBadge.tsx
├── LocationStatus.tsx
├── PhotoPreview.tsx
├── PrimaryButton.tsx
├── LoadingState.tsx
├── EmptyState.tsx
└── ErrorMessage.tsx
```

Avoid putting all UI code inside a single screen.

---

# 23. Data Models

## User

```ts
User {
  id: string
  name: string
  studentId?: string
  email: string
  role: "student" | "teacher"
  profileImage?: string
}
```

---

## Course

```ts
Course {
  id: string
  name: string
  code: string
  teacherId: string
}
```

---

## Attendance Session

```ts
AttendanceSession {
  id: string
  courseId: string
  date: string
  startTime: string
  endTime: string
  latitude: number
  longitude: number
  allowedRadius: number
  status: "open" | "closed"
}
```

---

## Attendance

```ts
Attendance {
  id: string
  sessionId: string
  studentId: string
  timestamp: string

  latitude: number
  longitude: number

  distanceFromClassroom: number
  gpsAccuracy: number

  photoUrl: string

  status: "present" | "late" | "rejected"
}
```

---

# 24. API Design

Recommended REST endpoints:

## Authentication

```http
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
POST /api/auth/logout
```

## Courses

```http
GET /api/courses
GET /api/courses/:id
```

## Attendance Sessions

```http
GET /api/sessions/today
GET /api/sessions/:id
POST /api/sessions
PATCH /api/sessions/:id
```

## Attendance

```http
POST /api/attendance
GET /api/attendance
GET /api/attendance/:id
GET /api/sessions/:id/attendance
```

---

# 25. Attendance Submission

The mobile app should send:

```json
{
  "sessionId": "session-001",
  "latitude": 16.123456,
  "longitude": 102.123456,
  "gpsAccuracy": 8.5,
  "photo": "multipart/form-data"
}
```

The server should perform the final validation.

Important:

> Do NOT trust the mobile application to decide whether attendance is valid.

The backend should independently verify:

* Authentication
* Session status
* Time window
* Duplicate attendance
* GPS distance
* Required photo

---

# 26. Security Requirements

Implement reasonable security for a student project.

## Authentication

Use token-based authentication.

Store authentication credentials securely using:

```text
expo-secure-store
```

Do not store passwords in AsyncStorage.

---

## Authorization

Backend must verify the user's role.

Students must not be able to:

* Create attendance sessions
* Modify attendance records
* View other students' private attendance evidence

Teachers must only access sessions/courses they own.

---

## Photo Privacy

Attendance photos are private evidence.

Do not expose them through public URLs without authorization.

---

# 27. Local Storage

Use AsyncStorage for non-sensitive local application data such as:

* Cached course list
* Recent attendance history
* UI preferences

Use SecureStore for:

* Authentication token
* Sensitive session information

---

# 28. Offline Handling

If the device loses network connectivity:

Display:

```text
No internet connection.

Your attendance cannot be submitted
until the server can be reached.
```

For the first version, **do not automatically submit attendance later**.

This avoids problems with delayed attendance submissions.

Cached data may still be viewed.

---

# 29. Notifications

Use Expo Notifications.

Possible notification:

```text
Class starting soon

Mobile Application Development
starts in 15 minutes.

Don't forget to check in.
```

Notifications should be optional and handled through permissions.

---

# 30. Permission Handling

The application must gracefully handle:

## Camera permission denied

```text
Camera permission is required
to submit attendance evidence.

[ OPEN SETTINGS ]
```

## Location permission denied

```text
Location permission is required
to verify your classroom location.

[ OPEN SETTINGS ]
```

Never crash because a permission was denied.

---

# 31. UI / Visual Direction

The application should take inspiration from the **bureaucratic inspection atmosphere** of games such as *Papers, Please*, while remaining an original design.

Do NOT directly copy copyrighted artwork, logos, characters, or UI assets.

Visual direction:

* Minimal
* Bureaucratic
* Functional
* Slightly retro
* Dense information layout
* Strong typography
* Forms and verification panels
* Clear status indicators

The application should feel like:

> "You are passing through an attendance checkpoint."

Possible terminology:

```text
ATTENDANCE CHECKPOINT
VERIFY PRESENCE
PHOTO EVIDENCE
LOCATION VERIFIED
DOCUMENT RECEIVED
VERIFICATION COMPLETE
ACCESS GRANTED
ATTENDANCE REJECTED
```

Do not make the UI so decorative that usability suffers.

---

# 32. Color Direction

Use a restrained palette.

Primary:

* Dark charcoal
* Off-white
* Muted green
* Muted red
* Warm gray

Use green/red primarily for status information.

Avoid excessive gradients and modern glassmorphism.

---

# 33. Error States

Every network/device operation must have:

* Loading state
* Success state
* Error state
* Empty state

Examples:

```text
Unable to retrieve your location.

[ TRY AGAIN ]
```

```text
Unable to upload photo.

[ RETAKE PHOTO ]
```

```text
Unable to connect to server.

Please try again later.
```

---

# 34. Accessibility

Implement:

* Accessible labels
* Sufficient text contrast
* Large touch targets
* Meaningful button labels
* Screen-reader-friendly status messages
* Do not rely only on color to communicate status

Example:

Bad:

```text
Green = Present
Red = Absent
```

Better:

```text
✓ PRESENT
✕ ABSENT
```

---

# 35. Week 1–12 Mapping

The project should intentionally demonstrate the course progression.

| Week | Implementation                                |
| ---- | --------------------------------------------- |
| 1    | React Native, Expo, TypeScript, basic screens |
| 2    | Components, Props, State, Events              |
| 3    | Styling, Lists, Loading, Empty, Error         |
| 4    | Expo Router and navigation                    |
| 5    | Forms and state management                    |
| 6    | REST API and networking                       |
| 7    | AsyncStorage and offline data                 |
| 8    | Authentication and security                   |
| 9    | Camera and image handling                     |
| 10   | GPS and location verification                 |
| 11   | Notifications                                 |
| 12   | Architecture, performance, accessibility      |

---

# 36. Suggested Development Order

Build incrementally.

## Phase 1 — Foundation

Implement:

* Expo project
* TypeScript
* Navigation
* Theme
* Reusable components

---

## Phase 2 — Authentication

Implement:

* Login
* Register
* Logout
* Authentication state
* Student/Teacher role

---

## Phase 3 — Courses

Implement:

* Course list
* Course detail
* Today's classes

---

## Phase 4 — Attendance

Implement:

* Attendance session
* Attendance screen
* Attendance history
* Attendance detail

---

## Phase 5 — Location

Implement:

* Location permission
* Current coordinates
* Distance calculation
* Allowed radius verification

---

## Phase 6 — Camera

Implement:

* Camera permission
* Camera preview
* Capture
* Retake
* Photo preview

---

## Phase 7 — Submission

Combine:

```text
Authentication
      +
Active Session
      +
Location
      +
Photo
      +
Time
      ↓
Attendance Submission
```

---

## Phase 8 — Teacher Features

Implement:

* Create attendance session
* Set classroom location
* Open/close attendance
* View attendance list
* View evidence

---

## Phase 9 — Notifications

Implement:

* Upcoming class reminder
* Attendance reminder

---

## Phase 10 — Quality

Perform:

* Error handling
* Performance improvements
* Accessibility audit
* UI consistency
* Code refactoring

---

# 37. MVP Scope

The first working version MUST contain:

### Student

* Login
* View today's classes
* Check attendance
* GPS verification
* Take photo
* Submit attendance
* View attendance history

### Teacher

* Login
* Create attendance session
* Define location
* Open/close session
* View attendance list
* View evidence

Everything else is secondary.

---

# 38. Features NOT Required for MVP

Do not implement these unless the core system is already stable:

* Face recognition
* AI attendance verification
* Facial liveness detection
* QR code
* NFC
* Bluetooth beacon
* Complex analytics
* Biometric authentication
* Automatic background geofencing
* Advanced offline synchronization

These features can be future extensions.

---

# 39. Important Implementation Rules

1. Use TypeScript strictly.
2. Prefer reusable components.
3. Keep screens focused on UI and user interaction.
4. Put API logic in separate service modules.
5. Put authentication logic in a dedicated auth module/context.
6. Put location calculations in a dedicated utility/service.
7. Never store passwords locally.
8. Never trust client-side attendance validation alone.
9. Handle denied permissions gracefully.
10. Show loading/error/empty states.
11. Keep the application usable on both Android emulator and physical Android devices.
12. Avoid unnecessary dependencies.
13. Prefer Expo-compatible libraries.
14. Do not implement advanced features before the MVP works.
15. Keep the architecture simple enough for a student project.

---

# 40. Recommended Folder Structure

```text
present-please/
│
├── app/
│   ├── (auth)/
│   ├── (student)/
│   ├── (teacher)/
│   └── _layout.tsx
│
├── components/
│
├── constants/
│
├── contexts/
│   └── AuthContext.tsx
│
├── hooks/
│
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── attendance.ts
│   ├── location.ts
│   └── notification.ts
│
├── types/
│
├── utils/
│   ├── distance.ts
│   ├── validation.ts
│   └── formatting.ts
│
├── assets/
│
└── package.json
```

---

# 41. Definition of Done

The project is considered functional when:

* [ ] Student can register/login
* [ ] Teacher can login
* [ ] Student can see today's classes
* [ ] Teacher can create an attendance session
* [ ] Teacher can define classroom coordinates
* [ ] Student can request GPS permission
* [ ] Student location can be retrieved
* [ ] Distance from classroom can be calculated
* [ ] Student can take a photo
* [ ] Student can preview/retake photo
* [ ] Student can submit attendance
* [ ] Backend validates attendance
* [ ] Duplicate attendance is prevented
* [ ] Attendance history is displayed
* [ ] Teacher can view attendance
* [ ] Teacher can view evidence photo
* [ ] Authentication token is stored securely
* [ ] Permission errors are handled
* [ ] Network errors are handled
* [ ] Application does not crash during normal permission denial
* [ ] UI works on Android
* [ ] Code is organized into reusable components

---

# 42. Final Product Identity

## App Name

**Present, Please.**

## Tagline

**Verify your presence.**

Alternative:

**Proof of presence, please.**

## Core Concept

> **Photo + Location + Time = Verified Attendance**

The application should feel like a digital attendance checkpoint where students must prove that they are physically present before being marked as present.

The overall experience should be simple, fast, and functional rather than feature-heavy.
