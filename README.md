# Refreshing Digital Conference Management Platform

A multi-edition digital conference platform, content management system (CMS), and attendance-management solution for the annual "Refreshing" conference, built for the Lagos State Baptist Student Fellowship (LSBSF).

Full requirements live in the project SRS document (*Refreshing Digital Conference Management Platform — SRS, v1.0, July 2026*). **AGENTS.md covers non-negotiable process rules, architectural invariants, and historical bug patterns that any developer or AI assistant must read before touching this repository.**

---

## Overview & Role

- **Project Name:** Refreshing Digital Conference Management Platform
- **Organization:** Lagos State Baptist Student Fellowship (LSBSF)
- **My Role:** [My Role / Contribution Placeholder]
- **Repository Maintainer:** [Maintainer Placeholder]

---

## Technical Architecture & Stack

- **Frontend Framework:** Next.js 16 (App Router with Turbopack), React 19, TypeScript
- **Styling & UI:** Tailwind CSS v4, Lucide React icons
- **Data Persistence:** Firebase (Firestore database, Firebase Authentication, Cloud Functions v2)
- **Media Assets:** Cloudinary (client-side unsigned uploads via `ImageUploader`)
- **State & Data Fetching:** TanStack Query (React Query)
- **Offline Sync & Storage:** Dexie.js (IndexedDB wrapper) for check-in desk offline resiliency
- **Rich Text Editing:** Tiptap
- **Form Management:** React Hook Form + Zod validation
- **Hosting & Infrastructure:** Netlify (Frontend edge deployments), Firebase (Cloud Functions, Firestore, Auth)

---

## Core Features & Admin Functionality

### Public Visitor Portal
- **Edition-Scoped Pages:** Home, About, Ministers/Speakers, Programme Schedule, Resources & Conference Booklet, Gallery Albums, Announcements, FAQ, and Contact.
- **Dynamic Routing:** All public pages route under `/[eventId]/` to ensure historical conference editions remain permanently browsable.
- **Global Conference History:** Timeline feature spanning all 40+ years of conference history (`/timelineEntries`).

### Admin Dashboard & Management System
- **Authentication & Security:** Firebase email/password authentication with strict custom claims role verification (`superAdmin`, `eventAdmin`, `registrationStaff`, `checkinStaff`, `editor`, `viewer`).
- **User Account Management:** Provisioning admin accounts, password resets, role assignment, and access control.
- **Role Builder & Permissions:** Granular permission system for mapping actions across modules to user roles with server-side claim synchronization.
- **Attendee Directory & Batch Import:** High-throughput attendee management supporting `.xlsx` and `.csv` batch imports, full multi-stage dry-run validation, fuzzy duplicate detection, and manual conflict resolution.
- **Check-In Desk:** Fast check-in interface with barcode/QR scanning, online/offline synchronization via Dexie, and restricted PII access (`checkinView`).
- **Content Management Systems (CMS):** Content editors for Ministers, Programme schedule, Gallery albums & photos, FAQs, Announcements, and Contact info.
- **Audit Logging:** System-wide audit logs tracking administrative actions, user creation, and bulk operations.
- **System Settings & Edition Management:** Global default event selection, event metadata creation, and global configuration options.

---

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thistechbabe1/refrshing-website.git
   cd refrshing-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and populate the necessary configuration values (see details below):
   ```bash
   cp .env.example .env.local
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables Configuration

> [!IMPORTANT]
> Never commit actual credentials, private keys, or secret tokens to version control. Confirm `.env.local` is listed in `.gitignore`.

### Client-Side Variables (`NEXT_PUBLIC_`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_IMAGE_PRESET=YOUR_UNSIGNED_IMAGE_PRESET
NEXT_PUBLIC_CLOUDINARY_DOWNLOAD_PRESET=YOUR_UNSIGNED_DOWNLOAD_PRESET

NEXT_PUBLIC_DEFAULT_EVENT_ID=refreshing-2026
```

### Server-Side Variables (Cloud Functions & Server Routes)
```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@YOUR_PROJECT.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
```

---

## Data Model Structure

Firestore data is hierarchically organized under edition scopes to support multi-edition browsing:

```
/events/{eventId}/
  ├── ministers
  ├── sessions
  ├── bibleStudies
  ├── articles
  ├── advertisements
  ├── downloads
  ├── galleryAlbums
  ├── mediaItems
  ├── resources
  ├── announcements
  ├── faqs
  ├── committeeMembers
  ├── attendees
  ├── checkinView
  └── importBatches

/timelineEntries          <- Global collection (spans full 40-year history)
/users                    <- System administrator user profiles
/settings/global          <- Global configuration and default active edition
/audit_logs               <- System-wide administrative action logs
```

---

## Deployment & Build Guidelines

### Frontend Deployment (Netlify)
The frontend automatically builds and deploys on Netlify from target branch commits:
```bash
npm run build
```

### Cloud Functions Deployment
Cloud Functions reside in the `functions/` subfolder:
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```
*Note: Deploying Cloud Functions requires the GCP Firebase project to be on the Blaze plan.*

### Security Rules Deployment
```bash
firebase deploy --only firestore:rules
```

---

## Development Verification Commands

Before submitting pull requests or merging changes, execute the full verification suite:

```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Code Linting
npx eslint .

# 3. Security Unit Tests
npm test

# 4. Production Build Verification
npm run build
```