import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase/firestore";

const LAGOS_EAST = [
  "Afurugbin Association",
  "Abundant Life Association",
  "Amazing Grace Association",
  "Christ Kingdom Association",
  "Gideon 1 Association",
  "Gideon 2 Association",
  "Hebron Association",
  "Hephzibah Association",
  "Irepodun Association",
  "Itesiwaju Association",
  "The Christ Love Association",
  "The Great Olaoluwa Association",
  "Evangel Association",
  "Abundant Grace Association",
  "Kingdom Harvesters Association",
  "Abundant Blessing",
];

const LAGOS_WEST = [
  "JT Ayorinde Association",
  "Unity Association",
  "United Association",
  "Apapa Association",
  "Greater Grace Association",
  "Strong Tower Association",
  "New Creature Association",
  "New Heights Association",
  "New Life Association",
  "Shalom Association",
  "Cornerstone Association",
  "Good Message Association",
  "Good Herald Association",
  "Good News Association",
  "Pentecost Association",
  "Maranatha Association",
  "Anointed Association",
  "Ireti Ogo Association",
  "Abundant Grace Association",
  "New Creation Association",
  "Chosen Generation Association",
  "Victory Life Association",
  "Victory Light Association",
  "Victory Land Association",
  "Redeemers Association",
  "Ifelodun Association",
  "Living Faith Associational",
];

const LAGOS_CENTRAL = [
  "JT Ayorinde Association",
  "Unity Association",
  "United Association",
  "Apapa Association",
  "Greater Grace Association",
  "Strong Tower Association",
  "New Creature Association",
  "New Heights Association",
  "New Life Association",
  "Shalom Association",
];

const CAMPUS = [
  "LASU",
  "ACOED",
  "OCEANOGRAPHY",
  "MOCPED",
  "MEDILAG",
  "FCE (T) AKOKA",
  "UNILAG",
  "YABATECH",
  "LASPOTECH",
  "OGITECH",
  "Others"
];

// Mock Churches to support the demo file
const MOCK_CHURCHES = [
  { name: "Grace Impact Baptist Church", aliases: ["GIBC", "Grace Impact"], assoc: "Abundant Grace Association", conf: "lagos_east" },
  { name: "Greater Grace Baptist Church", aliases: [], assoc: "Greater Grace Association", conf: "lagos_west" },
  { name: "Pentecost Baptist Church", aliases: [], assoc: "Pentecost Association", conf: "lagos_west" },
  { name: "Strong Tower Baptist Church", aliases: [], assoc: "Strong Tower Association", conf: "lagos_central" },
  { name: "Good News Baptist Church", aliases: [], assoc: "Good News Association", conf: "lagos_west" },
  { name: "Gideon 1 Baptist Church", aliases: [], assoc: "Gideon 1 Association", conf: "lagos_east" },
  { name: "Amazing Grace Baptist Church", aliases: [], assoc: "Amazing Grace Association", conf: "lagos_east" },
  { name: "New Life Baptist Church", aliases: [], assoc: "New Life Association", conf: "lagos_west" },
];

export async function POST(req: Request) {
  try {
    const db = adminDb;
    const batch = db.batch();

    // 1. Seed Associations
    const assocMap = new Map<string, string>(); // name+conf -> id

    const addAssoc = (list: string[], confId: string) => {
      const unique = Array.from(new Set(list));
      unique.forEach(name => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const id = `${confId}_${slug}`;
        assocMap.set(`${name}_${confId}`, id);
        
        const ref = db.collection("associations").doc(id);
        batch.set(ref, {
          name,
          conferenceId: confId,
          active: true
        });
      });
    };

    addAssoc(LAGOS_EAST, "lagos_east");
    addAssoc(LAGOS_WEST, "lagos_west");
    addAssoc(LAGOS_CENTRAL, "lagos_central");
    addAssoc(CAMPUS, "campus_fellowship");

    // 2. Seed Churches
    MOCK_CHURCHES.forEach(c => {
       const assocId = assocMap.get(`${c.assoc}_${c.conf}`);
       const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
       const id = `${c.conf}_church_${slug}`;
       
       const ref = db.collection("churches").doc(id);
       batch.set(ref, {
         canonicalName: c.name,
         aliases: c.aliases,
         associationId: assocId || null,
         conferenceId: c.conf,
         active: true,
         createdAt: new Date().toISOString()
       });
    });

    await batch.commit();

    return NextResponse.json({ success: true, message: "Associations and Churches seeded successfully" });
  } catch (error: any) {
    console.error("Failed to seed master data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
