import { WeElement, define, h } from 'omi';
import type { NotesMap, PianoKeyPair, Song, SongNoteEntry, PianoStore } from '../../types';
import notes from './notes';
import moon from './songs/moon';
import fuji from './songs/fuji';
import later from './songs/later';
import pgydyd from './songs/pgydyd';
import xxy from './songs/xxy';
import pianoKeys from './pianoKeys';

/** Key code to note name mapping for white keys. */
const KEY_CODE_TO_NOTE: Record<number, string> = {
  49: 'C', 50: 'D', 51: 'E', 52: 'F', 53: 'G', 54: 'A', 55: 'B',
};

/** Key code to note name mapping for black (sharp) keys. */
const KEY_CODE_TO_SHARP: Record<number, string> = {
  81: 'C#', 87: 'D#', 69: 'F#', 82: 'G#', 84: 'A#',
};

/** White key background gradient. */
const WHITE_KEY_BG = 'linear-gradient(-30deg, #f8f8f8, #fff)';
/** Active key highlight gradient. */
const ACTIVE_KEY_BG = 'linear-gradient(-20deg, #3330fb, #000, #222)';
/** Black key background gradient. */
const BLACK_KEY_BG = 'linear-gradient(-20deg, #222, #000, #222)';

/** Duration in ms before a key returns to its default color. */
const KEY_HIGHLIGHT_DURATION = 1000;
/** Duration in ms before a note can be replayed. */
const NOTE_COOLDOWN_DURATION = 500;

/** Piano component data shape. */
interface PianoData {
  notes: NotesMap;
  pianoKeys: PianoKeyPair[];
}

/**
 * Main piano component: renders an interactive keyboard with
 * click/touch/keyboard input and auto-play song functionality.
 */
class AppPiano extends WeElement<Record<string, unknown>, PianoData> {
  declare store: PianoStore;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private interval: ReturnType<typeof setInterval> | undefined;

  /** Increment store counter. */
  private add = (): void => this.store.add();
  /** Decrement store counter. */
  private sub = (): void => this.store.sub();
  /** Set the current song in the store. */
  private setSong = (song: Song): void => this.store.setSong(song);

  render(): unknown {
    return h(
      'div', { class: '' },
      h('div', { class: 'piano' },
        this.data.pianoKeys.map((item: PianoKeyPair) => {
          return h('div', { class: 'piano-key' },
            // White key
            h('div', {
              'data-type': 'white',
              ref: (e: HTMLElement) => { (this as any)[item.white.name!] = e; },
              class: 'piano-key__white',
              onClick: this.playNote.bind(this, item.white.name!),
              'data-key': item.white.keyCode,
              'data-note': item.white.name,
            },
              h('span', { class: 'piano-note' }, item.white.name),
              h('audio', {
                preload: 'auto',
                src: this.data.notes[item.white.name!]?.url,
                hidden: 'true',
                'data-note': item.white.name,
                class: 'audioEle',
              }),
            ),
            // Black key
            h('div', {
              'data-type': 'black',
              ref: (e: HTMLElement) => { (this as any)[item.black.name!] = e; },
              style: { display: item.black.name ? 'block' : 'none' },
              class: 'piano-key__black',
              onClick: this.playNote.bind(this, item.black.name!),
              'data-key': item.black.keyCode,
              'data-note': item.black.name,
            },
              h('span', { class: 'piano-note', style: 'color:#fff' }, item.black.name),
              h('audio', {
                preload: 'auto',
                src: this.data.notes[item.black.name!]?.url,
                hidden: 'true',
                'data-note': item.black.name,
                class: 'audioEle',
              }),
            ),
          );
        }),
      ),
      // Song controls
      h('div', { class: 'text-center' },
        h('p', null, 'Click the button below to let the piano play the song automatically:'),
        h('p', null, '点击下面按钮让钢琴自动演奏歌曲:', this.store.data.count > 0 ? '1' : '0'),
        h('div', null,
          this.store.data.count > 0
            ? h('button', {
                onClick: this.stopSong.bind(this),
                class: 'btn btn-outline-info btn-stop',
              }, 'Stop & 暂停')
            : h('div', null,
                h('button', { onClick: this.playSong.bind(this, moon), class: 'btn btn-outline-info' }, '月亮代表我的心'),
                h('button', { onClick: this.playSong.bind(this, pgydyd), class: 'btn btn-outline-info' }, '蒲公英的约定'),
                h('button', { onClick: this.playSong.bind(this, xxy), class: 'btn btn-outline-info' }, '小幸运'),
                h('button', { onClick: this.playSong.bind(this, fuji), class: 'btn btn-outline-info' }, '富士山下&爱情转移'),
              ),
        ),
      ),
    );
  }

  /** Initialize component data and register keyboard event handler. */
  install(): void {
    this.data = { notes, pianoKeys };

    document.onkeydown = (event: KeyboardEvent): void => {
      const e = event || window.event;

      const playNoteWithModifier = (noteName: string): void => {
        if (e.shiftKey) {
          this.playNote(`${noteName}2`);
        } else if (e.altKey) {
          this.playNote(`${noteName}5`);
        } else if (e.ctrlKey) {
          this.playNote(`${noteName}3`);
        } else if (e.metaKey) {
          this.playNote(`${noteName}6`);
          e.preventDefault();
        } else {
          this.playNote(`${noteName}4`);
        }
      };

      // White keys: number keys 1-7
      const whiteNote = KEY_CODE_TO_NOTE[e.keyCode];
      if (whiteNote) {
        playNoteWithModifier(whiteNote);
      }

      // Black keys: Q, W, E, R, T
      const sharpNote = KEY_CODE_TO_SHARP[e.keyCode];
      if (sharpNote) {
        playNoteWithModifier(sharpNote);
      }
    };
  }

  /** Stop the currently playing song and reset state. */
  stopSong(): void {
    clearTimeout(this.timer);
    this.store.data.song = [];
    this.store.data.count = 0;
  }

  /**
   * Play a single note by name.
   * Highlights the key visually and plays the audio element.
   */
  playNote(name: string): void {
    if (!this.data.notes[name]) return;

    if (!this.data.notes[name].isPlay) {
      const keyElement = (this as any)[name] as HTMLElement;
      const audio = keyElement.childNodes[1] as HTMLAudioElement;

      keyElement.style.background = ACTIVE_KEY_BG;

      const highlightTimer = setTimeout(() => {
        const isWhite = keyElement.getAttribute('data-type') === 'white';
        keyElement.style.background = isWhite ? WHITE_KEY_BG : BLACK_KEY_BG;
        clearTimeout(highlightTimer);
      }, KEY_HIGHLIGHT_DURATION);

      audio.currentTime = 0;
      audio.play();

      this.data.notes[name].isPlay = true;
      const cooldownTimer = setTimeout(() => {
        this.data.notes[name].isPlay = false;
        clearTimeout(cooldownTimer);
      }, NOTE_COOLDOWN_DURATION);
    }
  }

  /**
   * Auto-play a complete song with proper timing.
   * Uses async/await for sequential note playback.
   */
  playSong(song: Song): void {
    this.setSong([...song]);
    let offset = 0;
    let time = 0;

    const playNext = async (): Promise<void> => {
      if (offset < song.length && this.store.data.song.length > 0) {
        const element = song[offset];

        switch (typeof element) {
          case 'string': {
            const letters = element.match(/[0-9]/g);
            if (letters) {
              time = letters.length === 1
                ? this.handleString(song, offset)
                : this.handleStrings(song, offset);
            }
            break;
          }
          case 'object':
            time = (element as SongNoteEntry).time;
            this.playNote((element as SongNoteEntry).note);
            break;
          case 'number':
            if (element === 0) time = 1000;
            break;
        }

        await new Promise<void>((resolve) => {
          const waitTimer = setTimeout(() => {
            clearTimeout(waitTimer);
            resolve();
          }, time);
        });

        offset++;
        this.update();
        this.add();
        playNext();
      } else {
        clearTimeout(this.timer);
        this.store.data.song = [];
        this.store.data.count = 0;
      }
    };

    playNext();
  }

  /**
   * Auto-play a song using setInterval (fixed 500ms intervals).
   * Alternative to playSong() for simpler playback.
   */
  playSongByInterval(song: Song): void {
    clearInterval(this.interval);
    let offset = 0;

    this.interval = setInterval(() => {
      if (offset < song.length) {
        const element = song[offset];

        switch (typeof element) {
          case 'string': {
            const letters = element.match(/[0-9]/g);
            if (letters) {
              letters.length === 1
                ? this.handleString(song, offset)
                : this.handleStrings(song, offset);
            }
            break;
          }
          case 'object':
            this.playNote((element as SongNoteEntry).note);
            break;
          case 'number':
            break;
        }
        ++offset;
      } else {
        clearInterval(this.interval);
      }
    }, 500);
  }

  /**
   * Handle a compound notation string containing multiple notes.
   * Parses notation like "1+2#3" into individual notes and returns the shortest time.
   */
  handleStrings(song: Song, offset: number): number {
    const reg = /[0-9]/g;
    const str = song[offset] as string;
    let order = 1;
    const result: Array<{ text: string; index: number; order: number }> = [];

    while (true) {
      const temp = reg.exec(str);
      if (temp) {
        result.push({ text: temp[0], index: temp.index, order: order++ });
      } else {
        break;
      }
    }

    result.forEach((item) => {
      switch (str[item.index - 1]) {
        case '1': case '2': case '3': case '4':
        case '5': case '6': case '7':
          break;
        case '+':
          item.text = `+${item.text}`;
          if (str[item.index - 2] === '+') item.text = `+${item.text}`;
          break;
        case '-':
          item.text = `-${item.text}`;
          if (str[item.index - 2] === '-') item.text = `-${item.text}`;
          break;
        case '#':
          item.text = `#${item.text}`;
          if (str[item.index - 2] === '-') {
            item.text = `-${item.text}`;
            if (str[item.index - 3] === '-') item.text = `-${item.text}`;
          } else if (str[item.index - 2] === '+') {
            item.text = `+${item.text}`;
            if (str[item.index - 3] === '+') item.text = `+${item.text}`;
          }
          break;
      }

      if (str[item.index + 1] === '.') {
        item.text = `${item.text}.`;
        if (str[item.index + 2] === '.') item.text = `${item.text}.`;
      }
    });

    const noteStrings = result.map((item) => item.text);
    const times = noteStrings.map((_, index) => this.handleString(noteStrings, index));
    return times.sort((a, b) => a - b)[0];
  }

  /**
   * Handle a single notation string and play the corresponding note.
   * Notation format: [modifier][#]digit[dots]
   *   - modifier: '-' (lower octave), '+' (higher octave)
   *   - '#': sharp note
   *   - digit: 1-7 maps to C-B
   *   - dots: duration multiplier (500ms per dot)
   * @returns Duration in milliseconds
   */
  handleString(song: Song, offset: number): number {
    const element = song[offset] as string;
    const letter = element.match(/[0-9]/g)?.[0];
    if (!letter) return 500;

    const subKey = element.split('-').length - 1;
    const addKey = element.split('+').length - 1;
    const pointKey = element.split('.').length - 1;
    const halfKey = element.split('#').length - 1;

    let note: string;
    let key: number;
    let time: number;

    if (letter === '0') return 1000;

    const NOTE_MAP: Record<string, string> = {
      '1': 'C', '2': 'D', '3': 'E', '4': 'F', '5': 'G', '6': 'A', '7': 'B',
    };
    note = NOTE_MAP[letter] ?? 'C';

    // Determine octave based on modifier keys
    if (addKey >= 2) key = 6;
    else if (addKey === 1) key = 5;
    else if (subKey >= 2) key = 2;
    else if (subKey === 1) key = 3;
    else key = 4;

    // Determine duration based on dots
    switch (pointKey) {
      case 0: time = 500; break;
      case 1: time = 1000; break;
      case 2: time = 1500; break;
      default: time = 500;
    }

    this.playNote(`${note}${halfKey > 0 ? '#' : ''}${key}`);
    return time;
  }

  /** Placeholder for future song recording feature. */
  recordSong(): void {
    // TODO: implement song recording
  }
}

AppPiano.css = `
  * {
    margin: 0;
    padding: 0;
  }

  .icon {
    width: 24px;
  }

  .piano {
    margin: 0 200px;
    background: linear-gradient(-65deg, #000, #222, #000, #666, #222 75%);
    border-top: .8rem solid #282828;
    box-shadow: inset 0 -1px 1px hsla(0, 0%, 100%, .5), inset -0.4rem 0.4rem #282828;
    display: flex;
    height: 20vh;
    justify-content: center;
    overflow: hidden;
    padding-bottom: 2%;
    padding-left: 2.5%;
    padding-right: 2.5%;
  }

  @media screen and (max-width: 1000px) {
    .piano {
      margin: 0 10px;
    }
  }

  .piano-key {
    color: blue;
    flex: 1;
    margin: 0 .1rem;
    max-width: 8.8rem;
    position: relative;
  }

  .piano-key__white {
    display: flex;
    flex-direction: column-reverse;
    background: ${WHITE_KEY_BG};
    box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 #fff, inset 1px 0 0 #fff, inset -1px 0 0 #fff, 0 4px 3px rgba(0, 0, 0, .7), inset 0 -1px 0 #fff, inset 1px 0 0 #fff, inset -1px -1px 15px rgba(0, 0, 0, .5), -3px 4px 6px rgba(0, 0, 0, .5);
    height: 100%;
    position: relative;
  }

  .piano-key__black {
    display: flex;
    flex-direction: column-reverse;
    background: ${BLACK_KEY_BG};
    box-shadow: inset 0 -1px 2px hsla(0, 0%, 100%, .4), 0 2px 3px rgba(0, 0, 0, .4);
    border-width: .2rem .4rem 1.2rem;
    border-style: solid;
    border-color: #666 #222 #111 #555;
    height: 60%;
    left: 100%;
    position: absolute;
    transform: translateX(-50%);
    top: 0;
    width: 70%;
    z-index: 1;
  }

  .piano-note {
    color: #000;
    font-size: 0px;
    text-align: center;
    height: 20px;
  }

  a {
    text-decoration: none;
  }

  .text-center {
    margin: 15px;
    text-align: center !important;
  }

  .btn-outline-info {
    color: #17a2b8;
    background-color: transparent;
    background-image: none;
    border-color: #17a2b8;
  }

  .btn {
    text-transform: none;
    margin: 15px;
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    border: 1px solid #17a2b8;
    padding: 8px 8px;
    font-size: 16px;
    line-height: 16px;
    border-radius: 2.5px;
  }

  .btn-stop {
    color: #ff7171;
    border-color: #ff7171;
  }
`;

AppPiano.use = [{ count: 'count', song: 'song' }];

define('app-piano', AppPiano);
