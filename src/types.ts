/** Represents a single piano note with its audio URL and play state. */
export interface NoteEntry {
  url: string;
  isPlay: boolean;
}

/** Map of note names to their audio entries. */
export type NotesMap = Record<string, NoteEntry>;

/** A single piano key definition (white or black). */
export interface PianoKeyDef {
  name: string | null;
  keyCode: number | null;
}

/** A piano key pair: one white key and one black key. */
export interface PianoKeyPair {
  white: PianoKeyDef;
  black: PianoKeyDef;
}

/** A song note entry with explicit note name and timing. */
export interface SongNoteEntry {
  note: string;
  time: number;
}

/** A song can contain string notation, note objects, or numeric rests. */
export type SongElement = string | SongNoteEntry | number;

/** A complete song is an array of song elements. */
export type Song = SongElement[];

/** Map of note names to keyboard shortcut strings. */
export type KeyboardMap = Record<string, string>;

/** Melody item with index for tracking playback position. */
export interface MelodyItem extends SongNoteEntry {
  index: number;
}

/** Omi store data shape for the piano app. */
export interface PianoStoreData {
  count: number;
  song: MelodyItem[][];
}

/** Omi store interface for the piano app. */
export interface PianoStore {
  data: PianoStoreData;
  sub(): void;
  add(): void;
  setSong(song: Song): void;
}
