/**
 * Enquiries Submission & Validation Module
 * Provides Zod schema validation and Firestore persistence functions for user contact forms.
 */

import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";
import { db, ACTIVE_EVENT_ID } from "./app";

export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export async function submitEnquiry(input: EnquiryInput): Promise<string> {
  const validated = enquirySchema.parse(input);
  
  const payload = {
    ...validated,
    eventId: ACTIVE_EVENT_ID,
    submittedAt: new Date().toISOString(),
  };

  const ref = collection(db, "enquiries");
  const docRef = await addDoc(ref, payload);
  return docRef.id;
}
