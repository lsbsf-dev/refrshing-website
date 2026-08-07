import { collection, doc, getDocs, setDoc, query, where, Timestamp, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";

export interface AssociationMaster {
  id: string; 
  name: string;
  conferenceId: "lagos_east" | "lagos_west" | "lagos_central" | "campus_fellowship";
  active: boolean;
}

export interface ChurchMaster {
  id: string;
  canonicalName: string;
  aliases: string[];
  associationId?: string; // Optional because Campus Fellowship churches might not have an association
  conferenceId: "lagos_east" | "lagos_west" | "lagos_central" | "campus_fellowship" | "other";
  campusFellowshipId?: string;
  active: boolean;
  createdAt: Timestamp;
}

export const associationConverter: FirestoreDataConverter<AssociationMaster> = {
  toFirestore(association: AssociationMaster) {
    return {
      name: association.name,
      conferenceId: association.conferenceId,
      active: association.active,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      conferenceId: data.conferenceId,
      active: data.active,
    };
  },
};

export const churchConverter: FirestoreDataConverter<ChurchMaster> = {
  toFirestore(church: ChurchMaster) {
    return {
      canonicalName: church.canonicalName,
      aliases: church.aliases || [],
      associationId: church.associationId || null,
      conferenceId: church.conferenceId,
      campusFellowshipId: church.campusFellowshipId || null,
      active: church.active,
      createdAt: church.createdAt,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      canonicalName: data.canonicalName,
      aliases: data.aliases || [],
      associationId: data.associationId || undefined,
      conferenceId: data.conferenceId,
      campusFellowshipId: data.campusFellowshipId || undefined,
      active: data.active,
      createdAt: data.createdAt,
    };
  },
};

/**
 * Fetch all active associations for a specific conference
 */
export async function getAssociationsByConference(conferenceId: string): Promise<AssociationMaster[]> {
  const ref = collection(db, "associations").withConverter(associationConverter);
  const q = query(ref, where("conferenceId", "==", conferenceId), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

/**
 * Fetch all active churches for a specific association
 */
export async function getChurchesByAssociation(associationId: string): Promise<ChurchMaster[]> {
  const ref = collection(db, "churches").withConverter(churchConverter);
  const q = query(ref, where("associationId", "==", associationId), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

/**
 * Fetch all active churches for a specific campus fellowship
 */
export async function getChurchesByCampus(campusId: string): Promise<ChurchMaster[]> {
  const ref = collection(db, "churches").withConverter(churchConverter);
  const q = query(ref, where("campusFellowshipId", "==", campusId), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}
