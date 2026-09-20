/**
 * Handler-Level Security Unit Tests
 * Located in src/__tests__/hotfix_security.test.js
 * 
 * Imports actual route handlers for:
 * 1. /api/import/attendees (GET, POST, DELETE)
 * 2. /api/admin/auth/me (POST)
 * 3. /seed actions (seedDatabase)
 * 
 * Mocks firebase-admin, api-auth, and audit modules.
 */

const assert = require("assert");
const path = require("path");
const fs = require("fs");
const Module = require("module");
const ts = require("typescript");

// Standard TypeScript loader for .ts files using repository's typescript compiler
require.extensions[".ts"] = function (module, filename) {
  const content = fs.readFileSync(filename, "utf8");
  const result = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  module._compile(result.outputText, filename);
};

// --- Setup Module Interception Mocks ---
const originalLoad = Module._load;

let mockCallerProfile = null;
let mockAuthVerifyTokenResult = null;
let mockFirestoreDoc = null;
let mockAuthUser = null;
let auditLogsWritten = [];
let batchCommitted = false;
let batchDeletedDocs = [];

Module._load = function (request, parent, isMain) {
  // Alias resolution for @/
  if (request.startsWith("@/")) {
    const relativePath = request.slice(2);
    const resolvedPath = path.resolve(__dirname, "..", relativePath);

    // Intercept specific module aliases
    if (relativePath.includes("lib/api-auth")) {
      return {
        verifyApiRequest: async (req, requiredPermission) => {
          if (!mockCallerProfile) {
            throw new Error("Missing or invalid Authorization header");
          }
          if (mockCallerProfile.errorStatus === 401) {
            throw new Error("Invalid or expired token");
          }
          if (mockCallerProfile.errorStatus === 403) {
            throw new Error("Forbidden: missing permission");
          }
          return mockCallerProfile;
        },
      };
    }

    if (relativePath.includes("lib/audit")) {
      return {
        logAudit: async (entry) => {
          auditLogsWritten.push(entry);
        },
      };
    }

    if (relativePath.includes("lib/permissions")) {
      return {
        Permissions: {
          Registrations: { Read: "Registrations.Read", Write: "Registrations.Write" },
          Users: { Read: "Users.Read", Write: "Users.Write" },
        },
      };
    }

    if (relativePath.includes("lib/firebase/admin")) {
      const mockBatch = {
        delete: (ref) => batchDeletedDocs.push(ref),
        commit: async () => {
          batchCommitted = true;
        },
      };

      const mockCollection = (collName) => ({
        doc: (docId) => ({
          collection: (subColl) => mockCollection(subColl),
          get: async () => mockFirestoreDoc || { exists: false, data: () => null, id: docId },
        }),
        limit: (n) => ({
          get: async () => ({
            empty: true,
            size: 0,
            docs: [],
          }),
        }),
        get: async () => ({
          size: 0,
          docs: [],
        }),
      });

      const mockAdminDb = {
        collection: mockCollection,
        batch: () => mockBatch,
      };

      const mockAuth = {
        verifyIdToken: async (token) => {
          if (!token || token === "invalid") {
            throw new Error("Invalid token");
          }
          return mockAuthVerifyTokenResult || { uid: "verified-uid-123" };
        },
        getUser: async (uid) => mockAuthUser || {
          customClaims: { role: "superAdmin", permissions: ["*"], allowedEvents: ["refreshing-2026"] }
        },
        getUserByEmail: async (email) => ({ uid: "user-uid-456", email }),
        createUser: async (data) => ({ uid: "user-uid-new", ...data }),
        updateUser: async (uid, data) => ({ uid, ...data }),
        generatePasswordResetLink: async (email) => `https://auth.firebase.com/reset?email=${encodeURIComponent(email)}`,
        setCustomUserClaims: async () => {},
      };

      return {
        adminDb: mockAdminDb,
        firestore: mockAdminDb,
        auth: mockAuth,
      };
    }

    // Try resolving .ts / .tsx / /index.ts
    const possibleExts = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];
    for (const ext of possibleExts) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return originalLoad.call(this, fullPath, parent, isMain);
      }
    }
  }

  if (request === "next/server") {
    return {
      NextResponse: {
        json: (body, init) => {
          const status = init?.status || 200;
          return {
            status,
            ok: status >= 200 && status < 300,
            json: async () => body,
            headers: new Map(Object.entries(init?.headers || {})),
          };
        },
      },
    };
  }

  return originalLoad.apply(this, arguments);
};

// Import ACTUAL route handlers from source files
const importAttendeesRoute = require("../app/api/import/attendees/route.ts");
const authMeRoute = require("../app/api/admin/auth/me/route.ts");
const seedActions = require("../app/(public)/seed/actions.ts");

let passed = 0;
let failed = 0;

async function test(name, fn) {
  mockCallerProfile = null;
  mockAuthVerifyTokenResult = null;
  mockFirestoreDoc = null;
  mockAuthUser = null;
  auditLogsWritten = [];
  batchCommitted = false;
  batchDeletedDocs = [];

  try {
    await fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log("==========================================");
  console.log("Running Handler-Level Security Unit Tests");
  console.log("==========================================\n");

  // 1. /api/import/attendees GET without token -> 401
  await test("/api/import/attendees GET: missing token returns 401", async () => {
    mockCallerProfile = null;
    const req = new Request("http://localhost/api/import/attendees");
    const res = await importAttendeesRoute.GET(req);
    assert.strictEqual(res.status, 401);
  });

  // 2. /api/import/attendees GET with invalid token -> 401
  await test("/api/import/attendees GET: invalid token returns 401", async () => {
    mockCallerProfile = { errorStatus: 401 };
    const req = new Request("http://localhost/api/import/attendees", {
      headers: { authorization: "Bearer invalid-token" }
    });
    const res = await importAttendeesRoute.GET(req);
    assert.strictEqual(res.status, 401);
  });

  // 3. /api/import/attendees POST with wrong permission -> 403
  await test("/api/import/attendees POST: wrong permission returns 403", async () => {
    mockCallerProfile = { errorStatus: 403 };
    const req = new Request("http://localhost/api/import/attendees", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: JSON.stringify({ mode: "dry_run", rows: [] })
    });
    const res = await importAttendeesRoute.POST(req);
    assert.strictEqual(res.status, 403);
  });

  // 4. /api/import/attendees DELETE: non-superAdmin cannot bulk delete -> 403
  await test("/api/import/attendees DELETE: non-superAdmin role returns 403", async () => {
    mockCallerProfile = { id: "user-1", email: "admin@example.com", role: "eventAdmin" };
    const req = new Request("http://localhost/api/import/attendees?eventId=refreshing-2026&confirmationText=refreshing-2026", {
      method: "DELETE",
      headers: { authorization: "Bearer valid-token" }
    });
    const res = await importAttendeesRoute.DELETE(req);
    const body = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.error.includes("Super Administrator"), true);
  });

  // 5. /api/import/attendees DELETE: wrong confirmation text -> 400
  await test("/api/import/attendees DELETE: mismatched confirmation text returns 400", async () => {
    mockCallerProfile = { id: "super-1", email: "super@example.com", role: "superAdmin" };
    const req = new Request("http://localhost/api/import/attendees?eventId=refreshing-2026&confirmationText=wrong-text", {
      method: "DELETE",
      headers: { authorization: "Bearer valid-token" }
    });
    const res = await importAttendeesRoute.DELETE(req);
    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.error.includes("Confirmation text mismatch"), true);
  });

  // 6. /api/import/attendees DELETE: valid superAdmin + correct confirmation works & writes audit log
  await test("/api/import/attendees DELETE: valid superAdmin with correct confirmation succeeds & logs audit with action DELETE", async () => {
    mockCallerProfile = { id: "super-1", email: "super@example.com", role: "superAdmin" };
    const req = new Request("http://localhost/api/import/attendees?eventId=refreshing-2026&confirmationText=refreshing-2026", {
      method: "DELETE",
      headers: { authorization: "Bearer valid-token" }
    });
    const res = await importAttendeesRoute.DELETE(req);
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(auditLogsWritten.length, 1);
    assert.strictEqual(auditLogsWritten[0].action, "DELETE");
    assert.strictEqual(auditLogsWritten[0].userId, "super-1");
  });

  // 7. /api/admin/auth/me: missing Bearer token -> 401
  await test("/api/admin/auth/me POST: missing Bearer header returns 401", async () => {
    const req = new Request("http://localhost/api/admin/auth/me", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ uid: "attempted-spoof-uid" })
    });
    const res = await authMeRoute.POST(req);
    assert.strictEqual(res.status, 401);
  });

  // 8. /api/admin/auth/me: body uid is ignored, token uid is used
  await test("/api/admin/auth/me POST: body uid is IGNORED, verified token uid is used", async () => {
    mockAuthVerifyTokenResult = { uid: "token-verified-uid-999" };
    mockFirestoreDoc = {
      exists: true,
      id: "token-verified-uid-999",
      data: () => ({ name: "Token User", email: "token@example.com", isActive: true })
    };
    mockAuthUser = {
      customClaims: { role: "eventAdmin", permissions: ["Registrations.Read"], allowedEvents: ["refreshing-2026"] }
    };

    const req = new Request("http://localhost/api/admin/auth/me", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer valid-firebase-token"
      },
      body: JSON.stringify({ uid: "malicious-attacker-uid" }) // Body UID should be ignored!
    });

    const res = await authMeRoute.POST(req);
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.uid, "token-verified-uid-999");
    assert.strictEqual(body.email, "token@example.com");
  });

  // 9. /seed action: disabled when ADMIN_SEED_ENABLED is not true
  await test("Seed action: disabled by default when ADMIN_SEED_ENABLED is not true", async () => {
    delete process.env.ADMIN_SEED_ENABLED;
    const res = await seedActions.seedDatabase("secret-passkey");
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.message.includes("disabled"), true);
  });

  console.log("\n------------------------------------------");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
