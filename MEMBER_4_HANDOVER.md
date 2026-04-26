# Member 4: Handover Document – Smart Campus Operations Hub

This document summarizes the complete implementation of the **Authentication, RBAC, and Notification** modules for Member 4. It is designed to help the next agent/developer quickly understand the architecture and continue development.

## 1. Module Overview
- **Member 4 Status:** [COMPLETED & MERGED with Assessment Branch]
- **Current Branch:** `feature/member-4-auth-notifications` (Now contains both Auth and Assessment logic)
- **Core Focus:** Security, User Identity, and Real-time Alerts.
- **Tech Stack:** Spring Boot 3, Spring Security, MongoDB, JWT (JJWT), React (Vite/TS), Lucide Icons.

---

## 2. Authentication & Identity
### Google OAuth2 Integration
- **Implementation:** `CustomOAuth2UserService` handles the Google profile extraction and MongoDB synchronization.
- **Auto-Registration:** New Google users are automatically registered with the `USER` role.
- **Success Handling:** `OAuth2AuthenticationSuccessHandler` redirects to the frontend with a signed JWT.

### Manual Authentication (Local)
- **Endpoints:** `/api/auth/register` and `/api/auth/login`.
- **Logic:** `AuthService` handles BCrypt password hashing and credential verification.

### JWT Source of Truth
- **Provider:** `JwtTokenProvider` generates and validates HS256 tokens.
- **Rich Claims:** The JWT contains user ID, Name, Role, Picture, Phone, Department, and Bio. This allows the frontend to update instantly without DB re-fetching.

---

## 3. Premium User Profiles
- **Profile Page:** High-end glassmorphic UI with dynamic banners, stats (Account Type, Member Since), and an "About Me" section.
- **Extended Fields:** Added support for `phone`, `department`, and `bio` (up to 1000 characters).
- **Base64 Support:** The `imageUrl` field supports both standard URLs and Base64 Data URIs.
- **Success Feedback:** Integrated a custom toast notification system for profile updates.

---

## 4. RBAC (Role-Based Access Control)
- **Roles:** `USER`, `ADMIN`, `TECHNICIAN`.
- **Security Config:** `SecurityConfig.java` defines path-based authorization.
- **Backend Protection:** `@PreAuthorize` used for granular method-level security (e.g., Notification creation).

---

## 5. Notification Module
- **Backend:** `Notification` model with Types (`INFO`, `MAINTENANCE`, `SECURITY`).
- **REST API:** `NotificationController` supports fetching user notifications and marking them as read.
- **Frontend Context:** `NotificationContext` provides app-wide unread counts and live state updates.
- **UI:** Interactive bell icon in the header with a live unread badge and a dedicated `NotificationPage`.

---

## 6. Security Hardening & Fixes
- **Secret Management:** Sensitive credentials (Google Secret, MongoDB URI) are moved to `src/main/resources/application-local.properties` (Git-ignored).
- **NPE Prevention:** Added null-safety guards for all JWT claims.
- **Global Exception Handling:** `SmartCampusGlobalExceptionHandler` provides structured, user-friendly error messages for validation and internal errors.
- **Linting:** Frontend code is cleaned of unused imports and follows strict TypeScript typing.

---

## 7. Setup & Key Credentials
- **Local Config:** You MUST have `application-local.properties` in your resources folder.
- **Current Credentials (Local Dev):**
  - **Google Client ID:** `620984452938-mndag0n09ombgtjpb8pvg1rdpqfvp61l.apps.googleusercontent.com`
  - **Google Secret:** (Refer to `src/main/resources/application-local.properties` on the local machine)
- **Frontend Port:** `5173`
- **Backend Port:** `8080`

---

## 8. Primary File Registry
| Component | Key Files |
| :--- | :--- |
| **Security** | `SecurityConfig.java`, `JwtAuthenticationFilter.java`, `JwtTokenProvider.java` |
| **Auth Business Logic** | `AuthService.java`, `CustomOAuth2UserService.java` |
| **Controllers** | `AuthController.java`, `NotificationController.java` |
| **Frontend UI** | `ProfilePage.tsx`, `SecurityPage.tsx`, `NotificationPage.tsx` |
| **State Management** | `AuthContext.tsx`, `NotificationContext.tsx` |

---

**Status:** ALL Member 4 features are fully implemented, merged with the Assessment Service branch, validated, and pushed to the remote repository. The codebase is now a unified hub for both Authentication and Ticket Management.
