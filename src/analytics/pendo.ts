type PendoPropertyValue = string | number | boolean;

/** Track event properties. Properties set to `undefined` are left out of the event. */
export type PendoTrackProperties = Record<string, PendoPropertyValue | undefined>;

interface PendoIdentity {
  visitor: { id: string };
  account: { id: string };
}

interface PendoAgent {
  identify: (identity: PendoIdentity) => void;
  track: (trackType: string, properties?: Record<string, PendoPropertyValue>) => void;
}

declare global {
  interface Window {
    pendo?: PendoAgent;
  }
}

/**
 * Safe access to the Pendo agent on `window.pendo`: calls do nothing when the agent is not
 * loaded, and a failing Pendo call never breaks the flow being tracked.
 */
export const pendo = {
  identify(identity: PendoIdentity): void {
    try {
      window.pendo?.identify(identity);
    } catch (err) {
      console.warn("Pendo identify failed", err);
    }
  },

  track(trackType: string, properties: PendoTrackProperties = {}): void {
    const definedProperties: Record<string, PendoPropertyValue> = {};
    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined) definedProperties[key] = value;
    }
    try {
      window.pendo?.track(trackType, definedProperties);
    } catch (err) {
      console.warn(`Pendo track "${trackType}" failed`, err);
    }
  },
};

/**
 * HTTP status of a failed `api` request, parsed from the error that `api/client.ts` throws
 * ("POST /api/auth/login failed with 401"). `undefined` for network errors.
 */
export function getStatusCode(error: unknown): number | undefined {
  const match = error instanceof Error ? /failed with (\d{3})$/.exec(error.message) : null;
  return match ? Number(match[1]) : undefined;
}
