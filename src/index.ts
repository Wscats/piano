import { render } from 'omi';
import './assets/index.css';
import './elements/app';
import type { Song, MelodyItem, PianoStoreData } from './types';

/** Piano application store with state management. */
const store = {
  data: {
    count: 0,
    song: [] as MelodyItem[][],
  } satisfies PianoStoreData,

  /** Decrement the playback counter. */
  sub(this: { data: PianoStoreData }): void {
    this.data.count--;
  },

  /** Increment the playback counter. */
  add(this: { data: PianoStoreData }): void {
    this.data.count++;
  },

  /**
   * Set the current song, building indexed melody chunks for display.
   * Splits the song into groups of 30 notes for auto-play visualization.
   */
  setSong(this: { data: PianoStoreData }, song: Song): void {
    const melody: MelodyItem[] = song.map((item, index) => {
      if (typeof item === 'object' && 'note' in item) {
        return { ...item, index };
      }
      return { note: String(item), time: 500, index };
    });

    // Split into chunks of 30 notes for display
    for (let j = 0; j < melody.length; j += 30) {
      this.data.song.push(melody.slice(j, j + 30));
    }
  },
};

render(<my-app />, '#root', store);
