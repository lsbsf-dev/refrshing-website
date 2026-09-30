# Refreshing Conference Website & Admin OS

A modern, high-performance web platform and administrative operating system for the annual **Refreshing Conference**. The application serves both public conference attendees—providing multi-edition event archives, interactive schedules, digital booklets, speaker directories, and resource downloads—and conference staff via a role-based administrative portal with offline-first check-in capabilities.

🔗 **Live Platform**: [https://refreshing.org.ng](https://refreshing.org.ng)

---

## Tech Stack

The technology stack is strictly aligned with the dependencies defined in `package.json`:

* **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
* **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
* **Data & Backend Services**: 
  * [Firebase Web SDK v12](https://firebase.google.com/) (Authentication, Firestore, Analytics)
  * [Firebase Admin SDK v13](https://firebase.google.com/docs/admin/setup) (Server-side API routes & privileged operations)
  * [TanStack React Query v5](https://tanstack.com/query) (Client data fetching, caching, and state synchronization)
* **Offline Storage**: [Dexie.js v4](https://dexie.org/) (IndexedDB wrapper) & `dexie-react-hooks`
* **Rich Text Editing**: [TipTap v3](https://tiptap.dev/) (`starter-kit`, `react`, `extension-link`, `tiptap-markdown`), Turndown, DOMPurify
* **Forms & Validation**: React Hook Form, Zod, `@hookform/resolvers`
* **Data Visualization**: Recharts
* **Utilities**: `qrcode.react`, `xlsx` (Excel import/export), `browser-image-compression`

---

## Features

### Public Conference Portal (`/[eventId]`)
* **Multi-Edition Event Switcher**: Access current and historical conference editions across 40+ years of archives.
* **Interactive Schedule**: Day-by-day timetable filtering sessions, speaker outlines, and study materials.
* **Minister Directory**: Speaker profiles with detailed biographies and linked conference sessions.
* **Digital Booklet**: Interactive conference guide and session readings.
* **Resource Library**: Downloadable audio, video, study guides, and document media.
* **Announcements & Gallery**: Published news updates and photo albums.
* **Unified Global Search**: Instant search across ministers, programme sessions, booklet articles, and resources.

### Admin Operating System (`/admin`)
* **Role-Based Access Control (RBAC)**: Fine-grained permission model supporting `superAdmin`, `eventAdmin`, `registrationStaff`, `checkinStaff`, `editor`, and `viewer` roles.
* **Content Management System (CMS)**: Event-scoped collection managers for ministers, timetable sessions, announcements, gallery albums, and settings.
* **Attendee Registration & Directory**: Searchable attendee table supporting CSV/JSON bulk import, Excel export, and registration badge generation.
* **Offline-First Check-In Desk**: QR-scanner check-in interface backed by local IndexedDB caching to maintain operations during network outages.
* **Contact Enquiry Inbox**: Inbox for managing public contact submissions, featuring audit logging and typed DELETE confirmation modals.
* **Analytics & System Health**: Attendance charts, check-in stats, and system status monitors.

---

## Setup & Installation

### Prerequisites
* **Node.js**: v20.x or higher
* **Package Manager**: `npm` v10.x or higher

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lsbsf-dev/refrshing-website.git
   cd refrshing-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory (refer to the Environment Variables section below).

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

6. **Run Test Suite**:
   ```bash
   npm test
   ```

---

## Environment Variables

The following environment variables are required to configure Firebase and Cloudinary integrations. Specify these in `.env.local`:

### Firebase Web Client
* `NEXT_PUBLIC_FIREBASE_API_KEY`
* `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
* `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
* `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
* `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
* `NEXT_PUBLIC_FIREBASE_APP_ID`
* `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Firebase Admin SDK (Server Environment)
* `FIREBASE_CLIENT_EMAIL`
* `FIREBASE_PRIVATE_KEY`

### Cloudinary Uploads
* `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
* `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### System Utilities
* `ADMIN_SEED_ENABLED`

---

## Architecture Overview

```
src/
├── app/                  # Next.js App Router routes & layouts
│   ├── (admin)/admin/   # Protected administrative CMS & check-in routes
│   ├── (public)/[eventId]/ # Dynamic public event routes
│   └── api/              # Server-side API route handlers
├── components/           # UI components (admin, public, shared)
├── hooks/                # Custom React hooks & React Query data hooks
├── lib/                  # Core utilities, Firebase SDK clients, auth & permissions
│   ├── firebase/         # Firestore data access layer & queries
│   ├── contexts/         # React AuthContext provider
│   └── db.ts             # Dexie.js IndexedDB offline database configuration
└── types/                # TypeScript interface contracts
```

* **Next.js App Router**: Route groups separate `(public)` attendee views from protected `(admin)` CMS management views. Dynamic route parameters (`[eventId]`) scope all data queries to the active conference edition.
* **Firestore Data Model**: Event-scoped collections are stored under `/events/{eventId}/` (e.g. `/events/refreshing-2026/ministers`), isolating event content. Global collections (`events`, `users`, `settings`, `audit_logs`, `timelineEntries`) persist cross-edition metadata.
* **Cloudinary Media Storage**: Unsigned client-side uploads handle minister photos, gallery media, and banner images via `ImageUploader.tsx`.

---

## Known Issues

* **React Hooks Linter Warnings**: Legacy `react-hooks/set-state-in-effect` warnings exist in pre-existing form-initialization `useEffect` hooks across legacy admin pages (`settings/contact/page.tsx`, `AuthContext.tsx`). These are non-blocking and preserved for stability.
* **Storage Migration**: Background migration script (`scripts/migrate-images.js`) handles legacy `firebasestorage.googleapis.com` URLs to Cloudinary CDN URLs.

---

## My Role

*(Placeholder — add your custom role description, key architectural contributions, and project lead highlights here).*