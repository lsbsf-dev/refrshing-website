const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const eventId = process.env.NEXT_PUBLIC_ACTIVE_EVENT_ID || process.env.FIREBASE_PROJECT_ID || 'refreshing-2026';
const projectId = process.env.FIREBASE_PROJECT_ID || 'refreshing-website';

const serviceAccount = {
  projectId,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
};

if (!serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('Missing Firebase Admin credentials in .env.local.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const rootDir = path.join(__dirname, '..');
const seedFilesDir = path.join(rootDir, 'seed files');

function readSeedFile(filename) {
  const filePath = path.join(seedFilesDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing seed file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
}

function normalizeName(name = '') {
  return String(name)
    .toLowerCase()
    .replace(/\b(pst|pst\.|rev\.|rev'd|dr\.|prof\.|bro\.|sis\.|mr\.|mrs\.|sr\.|fr\.)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildHtmlText(text) {
  const cleanText = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!cleanText) return '';
  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`)
    .join('');
  return paragraphs || `<p>${cleanText.replace(/\n/g, '<br/>')}</p>`;
}

function createSummary(content) {
  const raw = String(content || '').replace(/<[^>]*>/g, ' ');
  const plain = raw.replace(/\s+/g, ' ').trim();
  return plain.length > 200 ? `${plain.slice(0, 197).trim()}...` : plain;
}

function makeSessionDocId(session) {
  return slugify(`${session.day || 'day'}-${session.title || 'session'}-${session.startTime || 'time'}`);
}

function buildSessionPayload(session) {
  const moderator = session.moderator || '';
  const minister = session.minister || '';
  const descriptionParts = [
    moderator ? `Moderator: ${moderator}` : '',
    minister ? `Assigned minister: ${minister}` : ''
  ].filter(Boolean);

  return {
    eventId,
    slug: makeSessionDocId(session),
    day: String(session.day || ''),
    title: String(session.title || ''),
    description: descriptionParts.join(' • ') || session.description || '',
    startTime: String(session.startTime || ''),
    endTime: String(session.endTime || ''),
    venue: String(session.venue || ''),
    minister: minister,
    moderator: moderator,
    ministerNames: minister ? [minister] : [],
    ministerIds: [],
    status: 'published',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function ensureSessionCollection() {
  const collectionRef = db.collection('events').doc(eventId).collection('sessions');
  return collectionRef;
}

async function writeSessions() {
  const sessions = readSeedFile('seed_sessions.json');
  const sessionCollection = await ensureSessionCollection();
  let written = 0;

  for (const item of sessions) {
    const docId = makeSessionDocId(item);
    const payload = buildSessionPayload(item);
    await sessionCollection.doc(docId).set(payload, { merge: true });
    written += 1;
  }

  return written;
}

async function writeBibleStudies() {
  const items = readSeedFile('seed_bibleStudy.json');
  const collectionRef = db.collection('events').doc(eventId).collection('bibleStudies');
  let written = 0;

  for (const item of items) {
    const docId = slugify(item.title || 'bible-study');
    const payload = {
      eventId,
      id: docId,
      slug: docId,
      title: String(item.title || ''),
      scripture: String(item.scripture || ''),
      author: String(item.author || ''),
      content: String(item.content || ''),
      notes: String(item.notes || ''),
      status: 'published',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await collectionRef.doc(docId).set(payload, { merge: true });
    written += 1;
  }

  return written;
}

async function writeArticles() {
  const items = readSeedFile('seed_articles.json');
  const collectionRef = db.collection('events').doc(eventId).collection('articles');
  let written = 0;

  for (const item of items) {
    const docId = slugify(item.title || 'article');
    const payload = {
      eventId,
      id: docId,
      slug: docId,
      title: String(item.title || ''),
      author: String(item.author || ''),
      content: String(item.content || ''),
      summary: createSummary(item.content || ''),
      coverImageUrl: '',
      publishedDate: item.publishedDate || new Date().toISOString().slice(0, 10),
      notes: String(item.notes || ''),
      status: 'published',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await collectionRef.doc(docId).set(payload, { merge: true });
    written += 1;
  }

  return written;
}

function bestMinisterMatch(targetName, ministerDocs) {
  if (!ministerDocs || ministerDocs.length === 0) return null;

  let best = null;

  for (const ministerDoc of ministerDocs) {
    const ministerName = ministerDoc.data().name || ministerDoc.id;
    const normalizedTarget = normalizeName(targetName);
    const normalizedMinister = normalizeName(ministerName);

    if (!normalizedTarget || !normalizedMinister) continue;

    let score = 0;
    if (normalizedTarget === normalizedMinister) score = 100;
    else if (normalizedTarget.includes(normalizedMinister) || normalizedMinister.includes(normalizedTarget)) score = 90;
    else {
      const targetWords = new Set(normalizedTarget.split(' ').filter(Boolean));
      const ministerWords = new Set(normalizedMinister.split(' ').filter(Boolean));
      const overlap = [...targetWords].filter((word) => word.length > 2 && ministerWords.has(word));
      score = overlap.length * 25;
    }

    if (score >= 50 && (!best || score > best.score)) {
      best = { score, ministerDoc, ministerName };
    }
  }

  return best;
}

async function writeMinisterBios() {
  const bios = readSeedFile('seed_ministerBios.json');
  const ministerCollectionRef = db.collection('events').doc(eventId).collection('ministers');
  const ministerSnapshot = await ministerCollectionRef.get();
  const ministerDocs = ministerSnapshot.docs;

  let matched = 0;
  const unmatched = [];

  for (const bioEntry of bios) {
    const match = bestMinisterMatch(bioEntry.matchName || '', ministerDocs);

    if (!match) {
      unmatched.push(bioEntry.matchName || 'Unknown');
      console.warn(`No minister match found for: ${bioEntry.matchName || 'Unknown'}`);
      continue;
    }

    const ministerRef = match.ministerDoc.ref;
    const biographyText = String(bioEntry.biography || '').trim();
    await ministerRef.set({ biography: biographyText, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    matched += 1;
  }

  return { matched, unmatched };
}

async function writeAboutSettings() {
  const content = readSeedFile('seed_aboutContent.json');
  const aboutSettingsRef = db.collection('events').doc(eventId).collection('aboutSettings');
  const snapshot = await aboutSettingsRef.limit(20).get();
  const targetDoc = snapshot.docs[0]?.ref || aboutSettingsRef.doc('settings');

  const infoHtml = [content.philosophy, content.invitation].filter(Boolean).join('\n\n');
  const historyHtml = content.history || '';

  const payload = {
    id: targetDoc.id,
    eventId,
    status: 'published',
    historyHtml: buildHtmlText(historyHtml),
    aboutLsbsfHtml: buildHtmlText(infoHtml),
    missionHtml: buildHtmlText(infoHtml),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await targetDoc.set(payload, { merge: true });

  console.log('Manual review required for fields intentionally not auto-written:');
  console.log(' - corePillars:', JSON.stringify(content.corePillars || [], null, 2));
  console.log(' - themeDescription:', content.themeDescription || '');
  console.log(' - welcomeSongLyrics:', content.welcomeSongLyrics || '');

  return payload;
}

async function main() {
  try {
    const sessionCount = await writeSessions();
    const bibleStudyCount = (await writeBibleStudies());
    const articleCount = (await writeArticles());
    const ministerStats = await writeMinisterBios();
    await writeAboutSettings();

    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Sessions written: ${sessionCount}`);
    console.log(`Bible studies written: ${bibleStudyCount}`);
    console.log(`Articles written: ${articleCount}`);
    console.log(`Ministers matched/updated: ${ministerStats.matched}`);
    console.log(`Ministers with no match found: ${ministerStats.unmatched.length}`);
    console.log('Unmatched minister names:', ministerStats.unmatched.length ? ministerStats.unmatched.join(', ') : 'None');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

main();
