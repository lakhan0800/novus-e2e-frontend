/** The Pendo web SDK global, defined by the install snippet in index.html. */
type PendoMetadataValue = string | number | boolean;

interface PendoOptions {
  visitor: { id: string; [field: string]: PendoMetadataValue };
  account?: { id: string; [field: string]: PendoMetadataValue };
}

interface Pendo {
  initialize(options: PendoOptions): void;
  identify(options: PendoOptions): void;
  /** Not stubbed by the install snippet, so it is undefined until pendo.js has loaded. */
  clearSession?: () => void;
}

declare var pendo: Pendo;
