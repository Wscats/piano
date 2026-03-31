import { WeElement, define, h } from "omi";
import notes from "./notes.js";
import moon from "./songs/moon.js";
import fuji from "./songs/fuji.js";
import later from "./songs/later.js";
import pgydyd from "./songs/pgydyd.js";
import xxy from "./songs/xxy.js";
import pianoKeys from "./pianoKeys.js";
import { PianoWorkerManager } from "../../workers/worker-manager.ts";
import { loadPianoWasm, parseNote, isWasmReady } from "../../wasm/wasm-client.ts";

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
              h("button", { onClick: this.playSong.bind(this, moon), class: "btn btn-outline-info" }, "月亮代表我的心"),
              h("button", { onClick: this.playSong.bind(this, pgydyd), class: "btn btn-outline-info" }, "蒲公英的约定"),
              h("button", { onClick: this.playSong.bind(this, xxy), class: "btn btn-outline-info" }, "小幸运"),
              h("button", { onClick: this.playSong.bind(this, fuji), class: "btn btn-outline-info" }, "富士山下&爱情转移")
            )
        )
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
   * Start auto-playing a song via the Web Worker.
   * The worker handles all timing; main thread only plays notes on demand.
   */
  playSong(song) {
    if (!this.workerManager) return;

    this.setSong([...song]);
    this.store.data.count = 1;
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
`;

AppPiano.use = [
  {
    count: "count",
    song: "song"
  }
];

define("app-piano", AppPiano);
