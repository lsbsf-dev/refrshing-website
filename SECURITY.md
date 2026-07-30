# Security Architecture: Refreshing 2026 Admin Portal

This document outlines the security architecture, role-based access controls, and instructions for managing remote onboarding and revocation for the Refreshing 2026 Admin Portal.

---

## 1. Zero-Trust Access Architecture

The Admin Portal is constructed using a multi-layered security layout to defend sensitive data (such as registrations, payments, and system controls) from unauthorized access.

```
                  [ PUBLIC CLOUD ]
                         │
                         ▼
        ┌──────────────────────────────────┐
        │        Cloudflare Access         │  <-- Layer 1: Perimeter Allowlist
        │  (Zero-Trust Email Authentication)│
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │       Next.js Admin Panel        │  <-- Layer 2: Frontend Route Guards
        │ (Static Pages / Client Context)  │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │      Firebase Auth / Claims      │  <-- Layer 3: Identity Provider
        │  (MFA Gated Session Validation)  │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │     Firestore Security Rules     │  <-- Layer 4: DB Level Enforcement
        │     (Scoped read/write checks)   │
        └──────────────────────────────────┘
```

---

## 2. Perimeter Layer: Cloudflare Access Configuration

To prevent public indexing and automated vulnerability scanners, the admin domain (`admin.refreshingwebsite.netlify.app`) sits behind **Cloudflare Access (Zero Trust)**.

### How to Configure (For the Admin Owner):
1. **Log in** to your Cloudflare Dashboard.
2. Navigate to **Zero Trust** ➔ **Access** ➔ **Applications**.
3. Click **Add an Application** and select **Self-hosted**.
4. Configure the application details:
   - **Application Name:** `Refreshing Admin Portal`
   - **Application Domain:** `admin.refreshingwebsite.netlify.app`
5. Under **Policies**, create an Access Policy:
   - **Policy Name:** `Organizing Committee Only`
   - **Action:** `Allow`
6. In **Assign Users / Rules**, select **Include** ➔ **Emails** or **Emails ending in** (e.g. `@lsbsf.org`) to specify the exact organizing members allowed to reach the page.
7. Click **Save Application**.

> [!NOTE]
> Cloudflare Access intercepts all requests before they hit the Next.js app or Firebase servers. Users must enter a temporary passcode sent to their email to gain access. This allowlist is completely managed in Cloudflare, allowing you to grant or revoke access instantly without writing code.

---

## 3. Roles & Permissions Matrix

Admin access is controlled via Firebase custom claims attached to the user's ID token.

| Role | Target Claims Scope | Permitted Capabilities & Routes | MFA Required |
| :--- | :--- | :--- | :--- |
| **`superAdmin`** | `role: "superAdmin"` | Unrestricted global access to all events, role assignments, audit logs, settings. | **Yes** |
| **`eventAdmin`** | `role: "eventAdmin"`, `allowedEvents: [...]` | Content + registration management scoped to their event IDs. | **Yes** |
| **`editor`** | `role: "editor"`, `allowedEvents: [...]` | Edit/Publish programme, speakers, resources, announcements, and FAQs. No access to payments/registrations. | No |
| **`registrationStaff`** | `role: "registrationStaff"`, `allowedEvents: [...]` | Read/Write access to attendee lists, payments, accommodation, transport allocations. | No |
| **`checkinStaff`** | `role: "checkinStaff"`, `allowedEvents: [...]` | Perform attendee check-ins (via callable function only) and print badges. Read-only access to `/checkinView`. | No |
| **`viewer`** | `role: "viewer"`, `allowedEvents: [...]` | Read-only analytics graphs and activity logs. | No |

---

## 4. User Onboarding (Invite Flow)

To onboard a new staff member securely without sharing passwords:

1. **Send Invite (Super Admin):**
   - The `superAdmin` goes to the **Users** section of the Admin Portal.
   - Enters the user's **Email**, selects their **Role**, and assigns the **Allowed Events** scopes.
   - Click **Send Invitation**.
   - Internally, this calls the `createInvite` Cloud Function which:
     - Creates a disabled user account in Firebase Auth.
     - Generates a cryptographically signed, single-use invite token with a 48-hour expiration.
     - Sends an email containing the activation link: `https://admin.refreshingwebsite.netlify.app/accept-invite?token=XYZ`.

2. **Accept Invitation (New User):**
   - The invitee clicks the link, which opens the `/accept-invite` page on the portal.
   - The user inputs and confirms their new password.
   - Upon submission, the client calls `acceptInvite` Cloud Function, which:
     - Validates the single-use token.
     - Enables the user account.
     - Configures the custom claims (`role`, `allowedEvents`, `mfaEnrolled: false`).
     - Initializes `/users/{userId}` metadata with `tokensValidAfter` timestamp.
   - If the user role is `superAdmin` or `eventAdmin`, they are redirected to `/mfa-setup` to configure TOTP multi-factor authentication before they can access any protected write pathways.

---

## 5. Session Revocation & Deactivation

If a staff member leaves or their account is compromised:

1. **Disable User:**
   - Go to the **Users** screen, locate the user, and click **Deactivate/Revoke**.
2. **Immediate Token Blacklist:**
   - The dashboard invokes the `revokeUserAccess` Cloud Function.
   - The function immediately:
     - Disables the user in Firebase Auth.
     - Updates the user's document in Firestore (`/users/{userId}`) setting `tokensValidAfter = serverTimestamp()`.
     - Calls `admin.auth().revokeRefreshTokens(uid)` to reject any future refresh requests.
   - The `firestore.rules` engine will block any request with an ID token whose `auth_time` is older than the new `tokensValidAfter` timestamp, killing their active browser session within seconds.
