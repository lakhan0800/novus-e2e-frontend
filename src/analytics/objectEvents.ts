/** Browser track events keyed by project/task ids — pairs with server events in novus-e2e-backend. */

declare global {
  interface Window {
    pendo?: {
      track: (eventName: string, metadata?: Record<string, string | boolean | number>) => void;
    };
  }
}

export interface ProjectObjectMetadata {
  projectId: string;
  accountId?: string;
  taskId?: string;
  projectStatus?: string;
}

export function trackProjectObjectEvent(
  eventName: string,
  metadata: ProjectObjectMetadata
): void {
  window.pendo?.track(eventName, metadata);
}
