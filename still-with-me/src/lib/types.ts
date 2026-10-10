export type Visibility = 'private' | 'public';

/** Whose words to draw from: only your own loved ones, or every public family too. */
export type Scope = 'mine' | 'everyone';

export interface LovedOne {
  id: string;
  ownerId: string;
  name: string;
  relationship: string;
  /** Free-form, e.g. "1941 – 2019". */
  years?: string;
  about?: string;
  /** Public loved ones (and their isms) are visible to every user of the app. */
  visibility: Visibility;
  createdAt: number;
}

export interface Ism {
  id: string;
  ownerId: string;
  lovedOneId: string;
  /** The words themselves, as they used to say it. */
  text: string;
  /** When or why they'd say it — the story behind the words. */
  context?: string;
  topics: string[];
  /** Keeps a single ism private even when the loved one is shared publicly. */
  keepPrivate?: boolean;
  createdAt: number;
}

export interface Settings {
  displayName: string;
  defaultScope: Scope;
}
