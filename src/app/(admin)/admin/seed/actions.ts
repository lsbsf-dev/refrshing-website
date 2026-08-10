"use server";

import fs from "fs";
import path from "path";
import { firestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Helper to normalize strings for comparison
function normalizeString(str: string): string {
  return String(str || "")
    .toLowerCase()
    .replace(/\b(pst|pst\.|rev\.|rev'd|dr\.|prof\.|bro\.|sis\.|mr\.|mrs\.|sr\.|fr\.)\b/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export async function runDatabaseSeedAction() {
  const eventId = process.env.NEXT_PUBLIC_ACTIVE_EVENT_ID || "refreshing-2026";
  const seedFilesDir = path.join(process.cwd(), "seed files");

  const results = {
    sessions: 0,
    bibleStudies: 0,
    articles: 0,
    ministersMatched: 0,
    ministersUnmatched: [] as string[],
    aboutContent: false,
    errors: [] as string[],
  };

  try {
    // 1. Sessions
    if (fs.existsSync(path.join(seedFilesDir, "seed_sessions.json"))) {
      const sessions = JSON.parse(fs.readFileSync(path.join(seedFilesDir, "seed_sessions.json"), "utf8"));
      const batch = firestore.batch();
      for (const item of sessions) {
        // use slugify logic to mimic import-content.js ID generation
        const slug = String(`${item.day || "day"}-${item.title || "session"}-${item.startTime || "time"}`)
          .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const docRef = firestore.collection("events").doc(eventId).collection("sessions").doc(slug);
        
        // build payload same as import-content.js
        const descriptionParts = [];
        if (item.moderator) descriptionParts.push(`Moderator: ${item.moderator}`);
        if (item.minister) descriptionParts.push(`Assigned minister: ${item.minister}`);
        const description = descriptionParts.join(' • ') || item.description || '';

        batch.set(docRef, {
          eventId,
          slug,
          day: String(item.day || ""),
          title: String(item.title || ""),
          description,
          startTime: String(item.startTime || ""),
          endTime: String(item.endTime || ""),
          venue: String(item.venue || ""),
          minister: item.minister || "",
          moderator: item.moderator || "",
          ministerNames: item.minister ? [item.minister] : [],
          ministerIds: [],
          status: "published",
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        results.sessions++;
      }
      if (results.sessions > 0) await batch.commit();
    }

    // 2. Bible Studies
    if (fs.existsSync(path.join(seedFilesDir, "seed_bibleStudy.json"))) {
      const bibleStudies = JSON.parse(fs.readFileSync(path.join(seedFilesDir, "seed_bibleStudy.json"), "utf8"));
      const batch = firestore.batch();
      for (const item of bibleStudies) {
        const slug = String(item.title || "bible-study").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const docRef = firestore.collection("events").doc(eventId).collection("bibleStudies").doc(slug);
        batch.set(docRef, {
          eventId,
          id: slug,
          slug,
          title: String(item.title || ""),
          scripture: String(item.scripture || ""),
          author: String(item.author || ""),
          content: String(item.content || ""),
          notes: String(item.notes || ""),
          status: "published",
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        results.bibleStudies++;
      }
      if (results.bibleStudies > 0) await batch.commit();
    }

    // 3. Articles
    if (fs.existsSync(path.join(seedFilesDir, "seed_articles.json"))) {
      const articles = JSON.parse(fs.readFileSync(path.join(seedFilesDir, "seed_articles.json"), "utf8"));
      const batch = firestore.batch();
      for (const item of articles) {
        const slug = String(item.title || "article").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const docRef = firestore.collection("events").doc(eventId).collection("articles").doc(slug);
        
        // create summary
        const raw = String(item.content || "").replace(/<[^>]*>/g, " ");
        const plain = raw.replace(/\s+/g, " ").trim();
        const summary = plain.length > 200 ? `${plain.slice(0, 197).trim()}...` : plain;

        batch.set(docRef, {
          eventId,
          id: slug,
          slug,
          title: String(item.title || ""),
          author: String(item.author || ""),
          content: String(item.content || ""),
          summary,
          coverImageUrl: "",
          publishedDate: item.publishedDate || new Date().toISOString().slice(0, 10),
          notes: String(item.notes || ""),
          status: "published",
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        results.articles++;
      }
      if (results.articles > 0) await batch.commit();
    }

    // 4. Ministers (Update existing by matchName)
    if (fs.existsSync(path.join(seedFilesDir, "seed_ministerBios.json"))) {
      const ministersData = JSON.parse(fs.readFileSync(path.join(seedFilesDir, "seed_ministerBios.json"), "utf8"));
      
      // Fetch all existing ministers first to match against
      const existingDocs = await firestore.collection("events").doc(eventId).collection("ministers").get();
      
      const batch = firestore.batch();
      let updatesInBatch = 0;

      for (const item of ministersData) {
        if (!item.matchName || !item.biography) continue;

        const targetNorm = normalizeString(item.matchName);
        let matchFound = false;

        for (const mDoc of existingDocs.docs) {
          const mData = mDoc.data();
          const docNameNorm = normalizeString(mData.name || mDoc.id);
          
          if (docNameNorm === targetNorm || docNameNorm.includes(targetNorm) || targetNorm.includes(docNameNorm)) {
            // Found a match
            batch.update(mDoc.ref, { 
              biography: item.biography,
              updatedAt: FieldValue.serverTimestamp()
            });
            results.ministersMatched++;
            updatesInBatch++;
            matchFound = true;
            break;
          }
        }

        if (!matchFound) {
          results.ministersUnmatched.push(item.matchName);
        }
      }

      if (updatesInBatch > 0) await batch.commit();
    }

    // 5. About Content
    if (fs.existsSync(path.join(seedFilesDir, "seed_aboutContent.json"))) {
      const aboutContent = JSON.parse(fs.readFileSync(path.join(seedFilesDir, "seed_aboutContent.json"), "utf8"));
      
      const infoHtml = [aboutContent.philosophy, aboutContent.invitation].filter(Boolean).join("\n\n");
      const historyHtml = aboutContent.history || "";

      function buildHtmlText(text: string) {
        const cleanText = String(text || "").replace(/\r\n/g, "\n").trim();
        if (!cleanText) return "";
        const paragraphs = cleanText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
        return paragraphs || `<p>${cleanText.replace(/\n/g, "<br/>")}</p>`;
      }

      const settingsRef = firestore.collection("events").doc(eventId).collection("aboutSettings").doc("settings");
      await settingsRef.set({
        id: "settings",
        eventId,
        status: "published",
        historyHtml: buildHtmlText(historyHtml),
        aboutLsbsfHtml: buildHtmlText(infoHtml),
        missionHtml: buildHtmlText(infoHtml),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      
      results.aboutContent = true;
    }

  } catch (error: any) {
    console.error("Seed error:", error);
    results.errors.push(error.message);
  }

  return results;
}
