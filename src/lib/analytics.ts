/**
 * Custom Interaction Analytics Logger Module
 * Logs user interaction events, downloads, and newsletters signups.
 */

export interface AnalyticsEvent {
  category: "Engagement" | "Logistics" | "Programme" | "Resources";
  action: string; // e.g. "view_session" | "download_booklet" | "newsletter_subscribe"
  label?: string; // e.g. session title or resource slug
  value?: number;
}

export function logAnalyticsEvent(event: AnalyticsEvent) {
  // Safe console logger fallback for local environment debugging
  console.log(`[ANALYTICS EVENT] Category: ${event.category} | Action: ${event.action} | Label: ${event.label || "N/A"} | Value: ${event.value || 0}`);

  // Integrate standard GA / Google Tag Manager hooks if initialized
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
}
