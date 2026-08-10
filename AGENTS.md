<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Rules for the Refreshing Codebase

Read this before making any change. This project has been through extensive debugging, and most bugs that will look "new" to a fresh agent are actually repeats of something already found and fixed once. Check the "Known Past Bugs" section before proposing a fix for anything that smells familiar.

## Process rules (non-negotiable)

1. **A passing `npm run build` proves type-safety, nothing else.** It does not prove a Firestore write succeeds, a rule doesn't block a real user, an image actually loads, or a button actually does anything when clicked. Every fix must be verified with real evidence — an actual console log, an actual Network tab response, an actual before/after count — before being reported as done. "Should work" is not "confirmed working."

2. **No architectural changes without flagging them as a decision first.** Do not silently swap a data schema, change how auth/permissions are resolved, move a data-fetching pattern (e.g. direct Firestore vs. API routes), or introduce a new page-builder/content model — even if it seems like an improvement — without explicitly surfacing it as a choice and getting confirmation. Several of the worst bugs in this project's history were unreviewed architectural pivots hidden inside commits with unrelated-sounding messages (e.g. a full page-builder schema change committed as "Add homepage preloader and fix dark mode").

3. **Don't leave dead code.** If a function, route, or component is replaced, delete the old one in the same change. Competing/duplicate implementations of the same action (e.g. two different check-in functions) have caused real confusion and bugs here before.

4. **Match existing naming/casing exactly.** Role values are `superAdmin`, `eventAdmin`, `registrationStaff`, `checkinStaff`, `editor`, `viewer` — camelCase, specific capitalization. A single lowercase typo (`superadmin` vs `superAdmin`) in `storage.rules` once silently broke all image uploads for weeks. Grep for the exact string before assuming a role check is correct.

5. **When something is "empty" on one page but has content on another page reading the same collection, do not assume it's a permissions bug by default.** Check for a hardcoded static-JSON fallback first (see Known Past Bugs #6) — this exact shape of bug has happened at least twice.

## Known past bugs — do not reintroduce these

1. **MFA was never in the spec.** An `mfaEnrolled` custom-claims gate was added to `firestore.rules` unprompted at some point, with no frontend enrollment flow to ever satisfy it — this permanently locked out every `superAdmin`/`eventAdmin` account. It has been fully removed. Do not re-add MFA/2FA to this project without it being explicitly requested — the actual spec requirement (SRS Section 7.1) is just email/password auth plus a minimum password-strength policy, enforced server-side in `provisionAdminAccount`.

2. **`isSessionValid()` type-mismatch bug.** A session-revocation field (`tokensValidAfter`) was written inconsistently across two files — one as a Firestore `Timestamp`, one as a millisecond number — while `firestore.rules` compared it against `request.auth.token.auth_time` (a plain Unix-seconds number). Comparing mismatched types in a security rule silently evaluates false, causing a **universal, role-independent** permission lockout. If you see identical "missing or insufficient permissions" errors across every collection for every role, suspect `isSessionValid()` first, not the individual collection's rule. Fixed with type-normalization logic inside the rule itself, plus standardizing all writers to store seconds. If touching this function again: **the `get()` call must stay inside the `!exists() ||` short-circuit** — hoisting it above the existence check will hard-deny any account without a profile document, which is the opposite of the intended fallback.

3. **`useAdminEvent()` fallback race.** Admin pages resolve the active event ID via a hook backed by a `useQuery` to `settings/global`. If that query is still loading, `ACTIVE_EVENT_ID` can briefly resolve to an empty string or a stale fallback before the real value loads, causing a query like `collection(db, "events", "", "ministers")` to silently return `[]` — no error, just empty. Every admin page using this pattern needs `enabled: !isEventLoading && !!ACTIVE_EVENT_ID` on its query. If a new admin page shows empty despite the collection having data, check this first.

4. **`isError` silently swallowed.** Several `useQuery` calls across admin pages destructured only `{ data, isLoading }`, never `isError`. A genuine Firestore permission-denied error and a genuinely empty collection render identically — both show "no data found." Any new data-fetching admin page must surface `isError` distinctly. Same applies to raw `onSnapshot()` listeners — they need an error callback, not just a success callback.

5. **CORS errors on Cloud Functions are usually not CORS problems.** If a properly-invoked `httpsCallable()` request fails with a CORS-preflight error, check `firebase functions:list` first — a function that isn't actually deployed (or whose deploy failed) returns an infrastructure-level error with no CORS headers attached, which the browser reports as a misleading "blocked by CORS policy" message. Don't add CORS config to fix this; deploy the function.

6. **Silent hardcoded fallbacks masking empty Firestore collections.** Several public pages (`ministers`, `programme`, `booklet`, `faq`, `announcements`) pass a bundled `seed*.json` file as React Query's `initialData`. This means the public site can show content while the actual Firestore collection is empty and the admin panel correctly shows nothing — creating a confusing mismatch that looks like a permissions bug but isn't. Some of this seed data (`seedResources.json`) turned out to be real, valuable content that was never migrated to Firestore, not placeholder data — check before deleting any seed file. Long-term direction: replace these with honest empty/loading states, not silent fake-looking content — but confirm the seed content isn't the *only* copy of something real before removing it.

7. **Resources/Articles/Bible Studies are deliberately separate collections, not one collection with a category field.** This matches SRS Section 9.1's data model (different field sets per type — articles have `featuredImageUrl`/`publishedAt`, bible studies have `scripture`/`attachmentUrl`). Do not consolidate them to "fix" a page that queries the wrong collection — fix the page's query instead. Also: Programme Bible Studies/Articles (SRS 5.4-B, part of the conference schedule) and the Resource Library (SRS 5.7, a downloadable-materials catalog) are two conceptually different features that happen to share similar category names — don't merge these either.

8. **`timelineEntries` has no `eventId` field.** It's the one collection that's deliberately global, spanning all conference editions (the 40-year history). Every other content collection is scoped under `/events/{eventId}/`.

9. **Firebase Storage → Cloudinary migration is in progress, not complete.** New uploads should go through Cloudinary (unsigned client-side upload via `ImageUploader.tsx`). Existing image URLs already in Firestore may still point at `firebasestorage.googleapis.com` until the migration script (`scripts/migrate-images.js`) has been run and verified across all image-bearing collections. Do not delete Firebase Storage files or rules until this is explicitly confirmed complete and approved.

10. **Two roles beyond the SRS: `registrationStaff` and `checkinStaff`.** The SRS defines a single "Registration Team" role; the codebase splits it into two for narrower PII exposure at the check-in desk (`checkinStaff` reads a PII-stripped `checkinView` denormalization instead of the full `attendees` collection). This is an intentional, documented deviation — not a bug, don't "fix" it by merging them back.

11. **Deploying Cloud Functions requires the Blaze plan** (Google requirement for Cloud Build, not because the app has real costs — actual usage is a small fraction of free-tier limits). If a deploy fails with a billing-related error, that's the cause.

12. **A deploy hanging with "Cannot determine backend specification. Timeout after 10000"** means something in `functions/src` blocks at module-load time (not function-call time) — commonly caused by mixing Firebase Functions v1 (`functions.https.onCall`) and v2 (`defineSecret` from `firebase-functions/params`) syntax in the same codebase. Use `firebase deploy --only functions --debug` to find the actual hang location — don't guess.

## Open items as of last handoff

- Testimonials/prayer-request submission + moderation flow (SRS Section 4.6) is specified but not built.
- Gallery album cover images reported broken — investigate against the Cloudinary migration and `next.config.ts` `remotePatterns` before assuming a new cause.
- Contact page info reported outdated — check for the hardcoded-fallback pattern (#6 above) before assuming it's an admin-save bug.
- Full manual verification pass (see any `testing-checklist` artifact from prior sessions) has not been completed end-to-end in one sitting — most fixes have been verified individually but not as a full regression pass.