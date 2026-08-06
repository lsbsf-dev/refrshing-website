/**
 * Newsletter Subscription & Validation Module
 * Provides Zod schema validation and Firestore persistence functions for newsletter signups.
 */

import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";
import { db } from "./app";

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

export async function subscribeToNewsletter(data: z.infer<typeof newsletterSchema>, eventId: string) {
  try {
    const docRef = await addDoc(collection(db, "newsletter"), {
      ...data,
      eventId: eventId,
      subscribedAt: new Date().toISOString(),
      status: "active"
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
}
