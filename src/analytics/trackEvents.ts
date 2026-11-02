/**
 * Browser Pendo Track Events for key product outcomes.
 * The `window.pendo` type is declared in ./objectEvents.
 */

/** Event names are registered in Pendo verbatim — do not reword or re-case them. */
export const TrackEventName = {
  SignedInSuccessfully: "Signed in successfully",
  TaskAdded: "Task added",
  PlanUpgraded: "Plan upgraded",
  AiReplyReceived: "AI reply received",
  InvitationSent: "Invitation sent",
} as const;

export type TrackEventName = (typeof TrackEventName)[keyof typeof TrackEventName];

export type TrackEventProperties = Record<string, string | boolean | number>;

/** Sends a Pendo Track Event; a missing or failing Pendo agent never breaks the app flow. */
export function trackEvent(eventName: TrackEventName, properties?: TrackEventProperties): void {
  try {
    window.pendo?.track(eventName, properties);
  } catch (trackError) {
    console.warn(`Pendo track failed for "${eventName}"`, trackError);
  }
}
