import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * Scheduled cleanup task: Runs daily to permanently purge soft-deleted trash older than 30 days.
 */
export const purgeTrash = functions.pubsub
  .schedule("0 0 * * *") // Run daily at midnight
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const collectionsToPurge = ["ministers", "sessions", "resources", "announcements", "galleryAlbums"];
    
    for (const colName of collectionsToPurge) {
      const snap = await db
        .collectionGroup(colName)
        .where("status", "==", "trash")
        .where("deletedAt", "<", thirtyDaysAgo)
        .get();

      const batch = db.batch();
      snap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      if (!snap.empty) {
        await batch.commit();
        console.log(`Purged ${snap.size} documents from collection group ${colName}`);
      }
    }
  });

/**
 * Scheduled cleanup task: Runs daily to prune version history older than 90 days.
 */
export const pruneVersionHistory = functions.pubsub
  .schedule("0 1 * * *") // Run daily at 1:00 AM
  .onRun(async (context) => {
    const db = admin.firestore();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Prune history collection group
    const snap = await db
      .collectionGroup("history")
      .where("createdAt", "<", ninetyDaysAgo)
      .get();

    const batch = db.batch();
    snap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    if (!snap.empty) {
      await batch.commit();
      console.log(`Pruned ${snap.size} old version documents from version history.`);
    }
  });
