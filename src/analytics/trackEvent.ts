/** Browser Pendo track events for key outcomes (sign-in, tasks, assistant, plan & team settings). */
// `window.pendo` is typed by the global declaration in ./objectEvents.

export type TrackEventProperties = Record<string, string | boolean | number>;

/**
 * Sends a Pendo track event. The Pendo agent attaches the visitor and account automatically.
 * No-ops when the agent is not loaded, and never lets a tracking failure break the app flow.
 */
export function trackEvent(eventName: string, properties?: TrackEventProperties): void {
  try {
    window.pendo?.track(eventName, properties);
  } catch (trackingError) {
    console.warn(`Pendo track event "${eventName}" failed`, trackingError);
  }
}
