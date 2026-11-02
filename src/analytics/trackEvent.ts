/** Generic browser track events sent through the Pendo agent (see the `window.pendo` type in objectEvents.ts). */

export type TrackEventProperties = Record<string, string | boolean | number>;

export function trackEvent(eventName: string, properties?: TrackEventProperties): void {
  try {
    window.pendo?.track(eventName, properties);
  } catch {
    // Analytics must never break the user flow.
  }
}
