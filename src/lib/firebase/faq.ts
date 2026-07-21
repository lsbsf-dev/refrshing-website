/**
 * FAQ Query Module
 * Handlers for retrieving ordered FAQ questions.
 */

import { collection, doc, getDoc, getDocs, query, where, orderBy, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";
import { FAQ } from "@/types/faq";

import seedFaqs from "./seedFaqs.json";

export const faqConverter: FirestoreDataConverter<FAQ> = {
  toFirestore(faq: FAQ) {
    return {
      eventId: faq.eventId,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId || "",
      question: data.question || "",
      answer: data.answer || "",
      order: data.order || 0,
    };
  },
};

export async function getFAQs(eventId: string): Promise<FAQ[]> {
  try {
    const ref = collection(db, "faqs").withConverter(faqConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      orderBy("order", "asc")
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return (seedFaqs as FAQ[]).filter((f) => f.eventId === eventId);
    }
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getFAQs failed, using fallback static data:", error);
    return (seedFaqs as FAQ[]).filter((f) => f.eventId === eventId);
  }
}
