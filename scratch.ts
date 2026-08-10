import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./src/lib/firebase/app";

async function run() {
  console.log("=== CHECKING ALBUMS ===");
  const albumsSnap = await getDocs(collection(db, "galleryAlbums"));
  albumsSnap.forEach(doc => {
    const data = doc.data();
    console.log(`Album ${doc.id}: ${data.title}`);
    console.log(`Cover Image URL: ${data.coverImageUrl}`);
  });

  console.log("\n=== CHECKING CONTACT SETTINGS ===");
  const contactDoc = await getDoc(doc(db, "aboutSettings", "contact"));
  if (contactDoc.exists()) {
    console.log("Contact Doc Data:", contactDoc.data());
  } else {
    console.log("No contact document found in aboutSettings collection.");
  }
  
  const eventContactDoc = await getDoc(doc(db, "events", "refreshing-2026", "aboutSettings", "contact"));
  if (eventContactDoc.exists()) {
    console.log("Event Scoped Contact Doc Data:", eventContactDoc.data());
  } else {
    console.log("No event scoped contact document found either.");
  }
  
  process.exit(0);
}

run().catch(console.error);
