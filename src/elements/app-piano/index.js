import { WeElement, define, h } from "omi";
import notes from "./notes.js";
import moon from "./songs/moon.js";
import fuji from "./songs/fuji.js";
import later from "./songs/later.js";
import pgydyd from "./songs/pgydyd.js";
import xxy from "./songs/xxy.js";
import songLibrary from "./songs/song-library.js";
import pianoKeys from "./pianoKeys.js";
import { PianoWorkerManager } from "../../workers/worker-manager.ts";
import { loadPianoWasm, parseNote, isWasmReady } from "../../wasm/wasm-client.ts";

// Build category list from song library
const CATEGORIES = [...new Set(songLibrary.map(s => s.category))];

class AppPiano extends WeElement {
  constructor(...args) {
    super(...args);

    /** @type {PianoWorkerManager} */
    this.workerManager = null;
    this.wasmReady = false;

    this.add = () => this.store.add();
    this.sub = () => this.store.sub();
    this.setSong = song => this.store.setSong(song);
    this.setCount = count => this.store.setSong(count);

    // Song library state
    this.showLibrary = false;
    this.selectedCategory = 'All';
    this.searchQuery = '';
    this.libraryPage = 0;
    this.pageSize = 50;
  }

  render(props) {
    return h(
      "div",
      { class: "" },
      h(
        "div",
        { class: "piano" },
        this.data.pianoKeys.map(item => {
          return h(
            "div",
            { class: "piano-key" },
            h(
              "div",
              {
                "data-type": "white",
                ref: e => { this[item.white.name] = e; },
                class: "piano-key__white",
                onClick: this.playNote.bind(this, item.white.name),
                "data-key": item.white.keyCode,
                "data-note": item.white.name
              },
              h("span", { class: "piano-note" }, item.white.name),
              h("audio", {
                preload: "auto",
                src: this.data.notes[item.white.name].url,
                hidden: "true",
                "data-note": item.white.name,
                class: "audioEle"
              })
            ),
            h(
              "div",
              {
                "data-type": "black",
                ref: e => { this[item.black.name] = e; },
                style: { display: item.black.name ? "block" : "none" },
                class: "piano-key__black",
                onClick: this.playNote.bind(this, item.black.name),
                "data-key": item.black.keyCode,
                "data-note": item.black.name
              },
              h("span", { class: "piano-note", style: "color:#fff" }, item.black.name),
              h("audio", {
                preload: "auto",
                src: this.data.notes[item.black.name] && this.data.notes[item.black.name].url,
                hidden: "true",
                "data-note": item.black.name,
                class: "audioEle"
              })
            )
          );
        })
      ),
      h(
        "div",
        { class: "text-center" },
        h("p", null, "Click the button below to let the piano play the song automatically:"),
        h("p", null,
          "点击下面按钮让钢琴自动演奏歌曲:",
          this.store.data.count > 0 ? "1" : "0"
        ),
        h(
          "div",
          null,
          this.store.data.count > 0
            ? h("button", { onClick: this.stopSong.bind(this), class: "btn btn-outline-info btn-stop" }, "Stop & 暂停")
            : h(
              "div",
              null,
              // Original songs
              h("button", { onClick: this.playSong.bind(this, moon), class: "btn btn-outline-info" }, "月亮代表我的心"),
              h("button", { onClick: this.playSong.bind(this, pgydyd), class: "btn btn-outline-info" }, "蒲公英的约定"),
              h("button", { onClick: this.playSong.bind(this, xxy), class: "btn btn-outline-info" }, "小幸运"),
              h("button", { onClick: this.playSong.bind(this, fuji), class: "btn btn-outline-info" }, "富士山下&爱情转移"),
              // Song library toggle
              h("button", {
                onClick: this.toggleLibrary.bind(this),
                class: "btn btn-outline-info btn-library"
              }, this.showLibrary ? "🎵 收起曲库" : `🎵 曲库 (${songLibrary.length}首)`)
            )
        ),
        // Song library panel
        this.showLibrary && this.store.data.count <= 0 ? this.renderLibrary() : null
      )
    );
  }

  install() {
    this.data = { notes, pianoKeys };

    // Initialize Web Worker for song scheduling
    this.workerManager = new PianoWorkerManager();
    this.workerManager
      .onNote(note => this.playNote(note))
      .onFinish(() => this._onSongDone())
      .onStop(() => this._onSongDone());

    // Load WASM for main-thread note validation
    loadPianoWasm().then(() => {
      this.wasmReady = isWasmReady();
    });

    // Keyboard input handler
    document.onkeydown = event => {
      const e = event || window.event;

      const playNote = key => {
        if (e.shiftKey === true) {
          this.playNote(`${key}2`);
        } else if (e.altKey === true) {
          this.playNote(`${key}5`);
        } else if (e.ctrlKey === true) {
          this.playNote(`${key}3`);
        } else if (e.metaKey === true) {
          this.playNote(`${key}6`);
          e.returnValue = false;
        } else {
          this.playNote(`${key}4`);
        }
      };

      if (e && 49 <= e.keyCode && e.keyCode <= 55) {
        const keyNoteMap = { 49: "C", 50: "D", 51: "E", 52: "F", 53: "G", 54: "A", 55: "B" };
        const note = keyNoteMap[e.keyCode];
        if (note) playNote(note);
      }

      if (e && [81, 87, 69, 82, 84].includes(e.keyCode)) {
        const sharpNoteMap = { 81: "C#", 87: "D#", 69: "F#", 82: "G#", 84: "A#" };
        const note = sharpNoteMap[e.keyCode];
        if (note) playNote(note);
      }
    };
  }

  uninstall() {
    // Clean up worker when component unmounts
    if (this.workerManager) {
      this.workerManager.destroy();
      this.workerManager = null;
    }
    document.onkeydown = null;
  }

  _onSongDone() {
    this.store.data.song = [];
    this.store.data.count = 0;
    this.update();
  }

  stopSong() {
    if (this.workerManager) {
      this.workerManager.stop();
    }
    this._onSongDone();
  }

  /**
   * Play a single note by name. Uses WASM to validate the note on main thread.
   */
  playNote(name) {
    if (!name || !this.data.notes[name]) return;

    // Use WASM to validate note (MIDI number > 0 means valid)
    if (this.wasmReady) {
      const midi = parseNote(name);
      if (midi <= 0) return;
    }

    if (!this.data.notes[name]["isPlay"]) {
      const keyEl = this[name];
      if (!keyEl) return;

      const audio = keyEl.childNodes[1];
      keyEl.style.background = `linear-gradient(-20deg, #3330fb, #000, #222)`;

      const resetTimer = setTimeout(() => {
        keyEl.getAttribute("data-type") === "white"
          ? (keyEl.style.background = `linear-gradient(-30deg, #f8f8f8, #fff)`)
          : (keyEl.style.background = `linear-gradient(-20deg, #222, #000, #222)`);
        clearTimeout(resetTimer);
      }, 1000);

      audio.currentTime = 0;
      audio.play();
      this.data.notes[name]["isPlay"] = true;

      const isPlayTimer = setTimeout(() => {
        this.data.notes[name]["isPlay"] = false;
        clearTimeout(isPlayTimer);
      }, 500);
    }
  }

  /**
   * Toggle the song library panel visibility.
   */
  toggleLibrary() {
    this.showLibrary = !this.showLibrary;
    this.libraryPage = 0;
    this.update();
  }

  /**
   * Filter songs by category.
   */
  setCategory(category) {
    this.selectedCategory = category;
    this.libraryPage = 0;
    this.update();
  }

  /**
   * Handle search input.
   */
  handleSearch(e) {
    this.searchQuery = e.target.value;
    this.libraryPage = 0;
    this.update();
  }

  /**
   * Get filtered songs based on category and search query.
   */
  getFilteredSongs() {
    let filtered = songLibrary;
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(s => s.category === this.selectedCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  /**
   * Render the song library panel with category tabs, search, and pagination.
   */
  renderLibrary() {
    const filtered = this.getFilteredSongs();
    const totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = this.libraryPage * this.pageSize;
    const pageSongs = filtered.slice(start, start + this.pageSize);

    return h("div", { class: "library-panel" },
      // Search bar
      h("div", { class: "library-search" },
        h("input", {
          type: "text",
          placeholder: "\ud83d\udd0d \u641c\u7d22\u6b4c\u66f2\u540d\u79f0...",
          value: this.searchQuery,
          onInput: this.handleSearch.bind(this),
          class: "search-input"
        }),
        h("span", { class: "library-count" }, `\u5171 ${filtered.length} \u9996`)
      ),
      // Category tabs
      h("div", { class: "library-categories" },
        h("button", {
          class: `category-tab ${this.selectedCategory === 'All' ? 'active' : ''}`,
          onClick: () => { this.setCategory('All'); }
        }, "\u5168\u90e8"),
        CATEGORIES.map(cat =>
          h("button", {
            class: `category-tab ${this.selectedCategory === cat ? 'active' : ''}`,
            onClick: () => { this.setCategory(cat); }
          }, cat)
        )
      ),
      // Song list
      h("div", { class: "library-songs" },
        pageSongs.length > 0
          ? pageSongs.map(song =>
            h("button", {
              class: "song-item",
              onClick: () => { this.playSong(song.notes); },
              title: `${song.name} (${song.category}) - ${song.notes.length} notes`
            },
              h("span", { class: "song-name" }, song.name),
              h("span", { class: "song-category" }, song.category),
              h("span", { class: "song-notes" }, `${song.notes.length}\u266a`)
            )
          )
          : h("p", { class: "no-songs" }, "\u6ca1\u6709\u627e\u5230\u5339\u914d\u7684\u6b4c\u66f2")
      ),
      // Pagination
      totalPages > 1 ? h("div", { class: "library-pagination" },
        h("button", {
          class: "page-btn",
          disabled: this.libraryPage <= 0,
          onClick: () => { this.libraryPage--; this.update(); }
        }, "\u2190 \u4e0a\u4e00\u9875"),
        h("span", { class: "page-info" }, `${this.libraryPage + 1} / ${totalPages}`),
        h("button", {
          class: "page-btn",
          disabled: this.libraryPage >= totalPages - 1,
          onClick: () => { this.libraryPage++; this.update(); }
        }, "\u4e0b\u4e00\u9875 \u2192")
      ) : null
    );
  }

  /**
   * Start auto-playing a song via the Web Worker.
   * The worker handles all timing; main thread only plays notes on demand.
   */
  playSong(song) {
    if (!this.workerManager) return;

    this.setSong([...song]);
    this.store.data.count = 1;
    this.showLibrary = false;
    this.update();

    // Delegate scheduling entirely to the Worker
    this.workerManager.play(song);
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
    -webkit-box-shadow: inset 0 -1px 1px hsla(0, 0%, 100%, .5), inset -0.4rem 0.4rem #282828;
    box-shadow: inset 0 -1px 1px hsla(0, 0%, 100%, .5), inset -0.4rem 0.4rem #282828;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    height: 80vh;
    height: 20vh;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
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
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    margin: 0 .1rem;
    max-width: 8.8rem;
    position: relative;
  }

  .piano-key__white {
    display: flex;
    flex-direction: column-reverse;
    background: linear-gradient(-30deg, #f8f8f8, #fff);
    -webkit-box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 #fff, inset 1px 0 0 #fff, inset -1px 0 0 #fff, 0 4px 3px rgba(0, 0, 0, .7), inset 0 -1px 0 #fff, inset 1px 0 0 #fff, inset -1px -1px 15px rgba(0, 0, 0, .5), -3px 4px 6px rgba(0, 0, 0, .5);
    box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 #fff, inset 1px 0 0 #fff, inset -1px 0 0 #fff, 0 4px 3px rgba(0, 0, 0, .7), inset 0 -1px 0 #fff, inset 1px 0 0 #fff, inset -1px -1px 15px rgba(0, 0, 0, .5), -3px 4px 6px rgba(0, 0, 0, .5);
    height: 100%;
    position: relative;
  }

  .piano-key__black {
    display: flex;
    flex-direction: column-reverse;
    background: linear-gradient(-20deg, #222, #000, #222);
    -webkit-box-shadow: inset 0 -1px 2px hsla(0, 0%, 100%, .4), 0 2px 3px rgba(0, 0, 0, .4);
    box-shadow: inset 0 -1px 2px hsla(0, 0%, 100%, .4), 0 2px 3px rgba(0, 0, 0, .4);
    border-width: .2rem .4rem 1.2rem;
    border-style: solid;
    border-color: #666 #222 #111 #555;
    height: 60%;
    left: 100%;
    position: absolute;
    -webkit-transform: translateX(-50%);
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

  .btn-library {
    color: #e8a838;
    border-color: #e8a838;
    font-weight: 600;
  }

  .library-panel {
    margin: 10px auto;
    max-width: 900px;
    background: #1a1a2e;
    border-radius: 12px;
    padding: 20px;
    text-align: left;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .library-search {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
  }

  .search-input {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #333;
    border-radius: 8px;
    background: #16213e;
    color: #e0e0e0;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    border-color: #17a2b8;
  }

  .search-input::placeholder {
    color: #666;
  }

  .library-count {
    color: #888;
    font-size: 14px;
    white-space: nowrap;
  }

  .library-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 15px;
    padding-bottom: 12px;
    border-bottom: 1px solid #333;
  }

  .category-tab {
    padding: 5px 12px;
    border: 1px solid #444;
    border-radius: 16px;
    background: transparent;
    color: #aaa;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .category-tab:hover {
    border-color: #17a2b8;
    color: #17a2b8;
  }

  .category-tab.active {
    background: #17a2b8;
    border-color: #17a2b8;
    color: #fff;
  }

  .library-songs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
    padding: 4px;
  }

  .library-songs::-webkit-scrollbar {
    width: 6px;
  }

  .library-songs::-webkit-scrollbar-track {
    background: #16213e;
    border-radius: 3px;
  }

  .library-songs::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }

  .song-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid #333;
    border-radius: 8px;
    background: #16213e;
    color: #e0e0e0;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-size: 14px;
  }

  .song-item:hover {
    border-color: #17a2b8;
    background: #1a2744;
    transform: translateY(-1px);
  }

  .song-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .song-category {
    font-size: 11px;
    color: #888;
    background: #0f3460;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }

  .song-notes {
    font-size: 11px;
    color: #e8a838;
    white-space: nowrap;
  }

  .no-songs {
    color: #666;
    text-align: center;
    padding: 30px;
    grid-column: 1 / -1;
  }

  .library-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 15px;
    padding-top: 12px;
    border-top: 1px solid #333;
  }

  .page-btn {
    padding: 6px 16px;
    border: 1px solid #444;
    border-radius: 6px;
    background: transparent;
    color: #17a2b8;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }

  .page-btn:hover:not(:disabled) {
    background: #17a2b8;
    color: #fff;
  }

  .page-btn:disabled {
    color: #555;
    border-color: #333;
    cursor: not-allowed;
  }

  .page-info {
    color: #888;
    font-size: 14px;
  }
`;

AppPiano.use = [
  {
    count: "count",
    song: "song"
  }
];

define("app-piano", AppPiano);
