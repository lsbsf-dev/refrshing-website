/**
 * FAQ Type Model
 * Schema mapping for frequently asked questions list.
 */

export interface FAQ {
  id: string;
  eventId: string;
  question: string;
  answer: string;
  order: number;
}
