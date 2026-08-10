import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    console.log("Querying resources...");
    const ref = collection(db, "events", "refreshing-2026", "resources");
    const q = query(ref, where("status", "==", "published"));
    const snap = await getDocs(q);
    console.log(`Found ${snap.size} resources`);
    snap.docs.forEach(d => console.log(d.id, d.data().title));
    process.exit(0);
  } catch (error) {
    console.error("Error querying resources:", error);
    process.exit(1);
  }
}

run();
