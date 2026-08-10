/**
 * Enquiries Submission & Validation Module
 * Provides Zod schema validation and Firestore persistence functions for user contact forms.
 */

import { collection, addDoc, query, where, getDocs, FirestoreDataConverter } from "firebase/firestore";
import { z } from "zod";
import { db } from "./app";

export const enquirySchema = z.object({
  type: z.enum(["Enquiry", "Testimony", "Prayer Request"]).default("Enquiry"),
  name: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export interface EnquiryDoc extends EnquiryInput {
  id: string;
  eventId: string;
  submittedAt: string;
}

export const enquiryConverter: FirestoreDataConverter<EnquiryDoc> = {
  toFirestore(data: EnquiryDoc) {
    return {
      type: data.type,
      name: data.name || "",
      email: data.email || "",
      message: data.message,
      eventId: data.eventId,
      submittedAt: data.submittedAt,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      type: data.type || "Enquiry",
      name: data.name || "",
      email: data.email || "",
      message: data.message || "",
      eventId: data.eventId || "",
      submittedAt: data.submittedAt || "",
    } as EnquiryDoc;
  }
};

export async function submitEnquiry(input: EnquiryInput, eventId: string): Promise<string> {
  const validated = enquirySchema.parse(input);
  
  const payload = {
    ...validated,
    eventId,
    submittedAt: new Date().toISOString(),
  };

  const ref = collection(db, "enquiries");
  const docRef = await addDoc(ref, payload);
  return docRef.id;
}

export async function getEnquiries(eventId: string): Promise<EnquiryDoc[]> {
  const ref = collection(db, "enquiries").withConverter(enquiryConverter);
  const q = query(ref, where("eventId", "==", eventId));
  const snap = await getDocs(q);
  const results = snap.docs.map(doc => doc.data());
  return results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}
