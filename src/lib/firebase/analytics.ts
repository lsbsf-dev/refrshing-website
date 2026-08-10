import { collection, doc, getDoc, getDocs, query, FirestoreDataConverter, Timestamp } from "firebase/firestore";
import { db } from "./app";

export interface AssociationAnalytics {
  id: string; // The slug
  name: string; // The full association or campus fellowship name
  conferenceId: string;
  registered: number;
  checkedIn: number;
  updatedAt: Timestamp;
}

export interface AnalyticsSummary {
  totalRegistered: number;
  totalCheckedIn: number;
  conferences: {
    [conferenceId: string]: {
      registered: number;
      checkedIn: number;
    }
  };
  updatedAt: Timestamp;
}

export const analyticsSummaryConverter: FirestoreDataConverter<AnalyticsSummary> = {
  toFirestore(data: AnalyticsSummary) {
    return data;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      totalRegistered: data.totalRegistered || 0,
      totalCheckedIn: data.totalCheckedIn || 0,
      conferences: data.conferences || {},
      updatedAt: data.updatedAt,
    };
  }
};

export const associationAnalyticsConverter: FirestoreDataConverter<AssociationAnalytics> = {
  toFirestore(data: AssociationAnalytics) {
    return data;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name || "Unknown",
      conferenceId: data.conferenceId || "other",
      registered: data.registered || 0,
      checkedIn: data.checkedIn || 0,
      updatedAt: data.updatedAt,
    };
  }
};

/**
 * Fetch the main analytics summary document containing global and conference-level stats.
 */
export async function getAnalyticsSummary(eventId: string): Promise<AnalyticsSummary | null> {
  const ref = doc(db, "events", eventId, "analyticsSummary", "main").withConverter(analyticsSummaryConverter);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Fetch the byAssociation breakdown for all associations across all conferences.
 */
export async function getAssociationAnalytics(eventId: string): Promise<AssociationAnalytics[]> {
  const ref = collection(db, "events", eventId, "analyticsSummary", "main", "byAssociation").withConverter(associationAnalyticsConverter);
  const snap = await getDocs(query(ref));
  return snap.docs.map(d => d.data());
}
