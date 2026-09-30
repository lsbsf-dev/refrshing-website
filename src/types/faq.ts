/**
 * @file faq.ts
 * @description TypeScript type definitions for FAQ items.
 */

export interface FAQ {
  id: string;
  eventId: string;
  question: string;
  answer: string;
  order: number;
}
