const id = "some_random_id";

async function test() {
  console.log("Starting fetch...");
  try {
    const res = await fetch("http://localhost:3000/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "update", 
        uid: id, 
        role: "superAdmin", 
        allowedEvents: ["test"],
        displayName: "test",
        email: "test@test.com",
        password: undefined
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (e) {
    console.error("Fetch failed", e);
  }
}

test();
