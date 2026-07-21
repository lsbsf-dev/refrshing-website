/**
 * Newsletter Subscription & Validation Module
 * Provides Zod schema validation and Firestore persistence functions for newsletter signups.
 */

import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";
import { db, ACTIVE_EVENT_ID } from "./app";

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

export async function submitNewsletter(input: NewsletterInput): Promise<string> {
  const validated = newsletterSchema.parse(input);
  
  const payload = {
    ...validated,
    eventId: ACTIVE_EVENT_ID,
    subscribedAt: new Date().toISOString(),
  };

  const ref = collection(db, "newsletter");
  const docRef = await addDoc(ref, payload);
  return docRef.id;
}
