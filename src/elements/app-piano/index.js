import { WeElement, define, h } from "omi";
import notes from "./notes.js";
import moon from "./songs/moon.js";
import fuji from "./songs/fuji.js";
import later from "./songs/later.js";
import pgydyd from "./songs/pgydyd.js";
import "omiu/button";

class AppPiano extends WeElement {
  constructor(...args) {
    super(...args);

    this.add = () => this.store.add();

    this.sub = () => this.store.sub();

    this.setSong = song => this.store.setSong(song);
  }

  render(props) {
    return h(
      "div",
      {
        class: ""
      },
      h(
        "div",
        {
          class: "piano"
        },
        this.data.pianoKeys.map(item => {
          return h(
            "div",
            {
              class: "piano-key"
            },
            h(
              "div",
              {
                "data-type": "white",
                ref: e => {
                  this[item.white.name] = e;
                },
                class: "piano-key__white",
                onClick: this.playNote.bind(this, item.white.name),
                "data-key": item.white.keyCode,
                "data-note": item.white.name
              },
              h(
                "span",
                {
                  class: "piano-note"
                },
                item.white.name
              ),
              h("audio", {
                preload: "auto",
                src: this.data.notes[item.white.name],
                hidden: "true",
                "data-note": item.white.name,
                class: "audioEle"
              })
            ),
            h(
              "div",
              {
                "data-type": "black",
                ref: e => {
                  this[item.black.name] = e;
                },
                style: {
                  display: item.black.name ? "block" : "none"
                },
                class: "piano-key__black",
                onClick: this.playNote.bind(this, item.black.name),
                "data-key": item.black.keyCode,
                "data-note": item.black.name
              },
              h(
                "span",
                {
                  class: "piano-note",
                  style: "color:#fff"
                },
                item.black.name
              ),
              h("audio", {
                preload: "auto",
                src: this.data.notes[item.white.name],
                hidden: "true",
                "data-note": item.white.name,
                class: "audioEle"
              })
            )
          );
        })
      ),
      h(
        "div",
        {
          class: "text-center"
        },
        h(
          "p",
          null,
          "Click the button below to let the piano play the song automatically:"
        ),
        h(
          "p",
          null,
          "\u70B9\u51FB\u4E0B\u9762\u6309\u94AE\u8BA9\u94A2\u7434\u81EA\u52A8\u6F14\u594F\u6B4C\u66F2:"
        ),
        h(
          "div",
          null,
          this.store.data.count > 0
            ? h(
                "button",
                {
                  onClick: this.stopSong.bind(this),
                  class: "btn btn-outline-info btn-stop"
                },
                "Stop & \u6682\u505C"
              )
            : h(
                "div",
                null,
                h(
                  "button",
                  {
                    onClick: this.playSong.bind(this, moon),
                    class: "btn btn-outline-info"
                  },
                  "\u6708\u4EAE\u4EE3\u8868\u6211\u7684\u5FC3"
                ),
                h(
                  "button",
                  {
                    onClick: this.playSong.bind(this, pgydyd),
                    class: "btn btn-outline-info"
                  },
                  "\u84B2\u516C\u82F1\u7684\u7EA6\u5B9A"
                ),
                h(
                  "button",
                  {
                    onClick: this.playSong.bind(this, fuji),
                    class: "btn btn-outline-info"
                  },
                  "\u5BCC\u58EB\u5C71\u4E0B&\u7231\u60C5\u8F6C\u79FB"
                )
              )
        )
      )
    );
  }

  install() {
    this.data = {
      notes: notes,
      pianoKeys: []
    };
    let pianoKeys = [];
    [2, 3, 4, 5, 6].map(item => {
      pianoKeys = pianoKeys.concat([
        {
          white: {
            name: `C${item}`,
            keyCode: 49
          },
          black: {
            name: `C#${item}`,
            keyCode: 81
          }
        },
        {
          white: {
            name: `D${item}`,
            keyCode: 50
          },
          black: {
            name: `D#${item}`,
            keyCode: 87
          }
        },
        {
          white: {
            name: `E${item}`,
            keyCode: 51
          },
          black: {
            name: null,
            keyCode: null
          }
        },
        {
          white: {
            name: `F${item}`,
            keyCode: 52
          },
          black: {
            name: `F#${item}`,
            keyCode: 69
          }
        },
        {
          white: {
            name: `G${item}`,
            keyCode: 53
          },
          black: {
            name: `G#${item}`,
            keyCode: 82
          }
        },
        {
          white: {
            name: `A${item}`,
            keyCode: 54
          },
          black: {
            name: `A#${item}`,
            keyCode: 84
          }
        },
        {
          white: {
            name: `B${item}`,
            keyCode: 55
          },
          black: {
            name: null,
            keyCode: null
          }
        }
      ]);
    });
    this.data.pianoKeys = pianoKeys;
    this.data.notes = notes;

    document.onkeydown = event => {
      console.log(event);
      var e = event || window.event || arguments.callee.caller.arguments[0];

      let playNote = key => {
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
        switch (e.keyCode) {
          case 49:
            playNote("C");
            break;

          case 50:
            playNote("D");
            break;

          case 51:
            playNote("E");
            break;

          case 52:
            playNote("F");
            break;

          case 53:
            playNote("G");
            break;

          case 54:
            playNote("A");
            break;

          case 55:
            playNote("B");
            break;
        }
      }

      if (
        e &&
        (81 === e.keyCode ||
          e.keyCode === 87 ||
          e.keyCode === 69 ||
          e.keyCode === 82 ||
          e.keyCode === 84)
      ) {
        switch (e.keyCode) {
          case 81:
            playNote("C#");
            break;

          case 87:
            playNote("D#");
            break;

          case 69:
            playNote("F#");
            break;

          case 82:
            playNote("G#");
            break;

          case 84:
            playNote("A#");
            break;
        }
      }
    };
  }

  stopSong() {
    clearTimeout(this.timer);
    this.store.data.song = [];
    this.store.data.count = 0;
    console.log("reset");
  }

  playNote(name) {
    let audio = this[name].childNodes[1];
    this[
      name
    ].style.background = `linear-gradient(-20deg, #3330fb, #000, #222)`;
    let timer = setTimeout(() => {
      this[name].getAttribute("data-type") === "white"
        ? (this[
            name
          ].style.background = `linear-gradient(-30deg, #f8f8f8, #fff)`)
        : (this[
            name
          ].style.background = `linear-gradient(-20deg, #222, #000, #222)`);
      clearTimeout(timer);
    }, 1000);
    audio.currentTime = 0;
    audio.play();
  }

  playSong(song) {
    this.setSong([...song]);
    let offset = 0;
    let time = 0;

    let playSong = async () => {
      if (offset < song.length && this.store.data.song.length > 0) {
        switch (typeof song[offset]) {
          case "string":
            let letters = song[offset].match(/[0-9]/g);

            switch (letters.length) {
              case 1:
                time = this.handleString(song, offset);
                break;

              default:
                time = this.handleStrings(song, offset);
                break;
            }

            break;

          case "object":
            console.log(song[offset]["note"]);
            time = song[offset]["time"];
            this.playNote(song[offset]["note"]);
            break;

          case "number":
            switch (song[offset]) {
              case 0:
                time = 1000;
                break;
            }

            break;
        }

        await new Promise(resolve => {
          let timer = setTimeout(() => {
            clearInterval(timer);
            resolve();
          }, time);
        });
        offset++;
        this.add();
        playSong();
      } else {
        clearTimeout(this.timer);
        this.store.data.song = [];
        this.store.data.count = 0;
        return;
      }
    };

    playSong();
  }

  playSongByInterval(song) {
    clearInterval(this.interval);
    let offset = 0;
    let time = 0;
    this.interval = setInterval(() => {
      if (offset < song.length) {
        switch (typeof song[offset]) {
          case "string":
            let letters = song[offset].match(/[0-9]/g);

            switch (letters.length) {
              case 1:
                time = this.handleString(song, offset);
                break;

              default:
                time = this.handleStrings(song, offset);
                break;
            }

            break;

          case "object":
            console.log(song[offset]["note"]);
            time = song[offset]["time"];
            this.playNote(song[offset]["note"]);
            break;

          case "number":
            switch (song[offset]) {
              case 0:
                time = 1000;
                break;
            }

            break;
        }

        ++offset;
      } else {
        clearInterval(this.interval);
      }
    }, 500);
  }

  handleStrings(song, offset) {
    let reg = /[0-9]/g;
    let str = song[offset];
    let order = 1;
    let result = [];

    while (true) {
      let temp = reg.exec(str);

      if (temp) {
        result.push({
          text: temp[0],
          index: temp.index,
          order: order
        });
        order++;
      } else {
        break;
      }
    }

    result.map(item => {
      switch (str[item.index - 1]) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
          break;

        case "+":
          item.text = `+${item.text}`;

          switch (str[item.index - 2]) {
            case "+":
              item.text = `+${item.text}`;
              break;
          }

          break;

        case "-":
          item.text = `-${item.text}`;

          switch (str[item.index - 2]) {
            case "-":
              item.text = `-${item.text}`;
              break;
          }

          break;

        case "#":
          item.text = `#${item.text}`;

          switch (str[item.index - 2]) {
            case "-":
              item.text = `-${item.text}`;

              switch (str[item.index - 3]) {
                case "-":
                  item.text = `-${item.text}`;
                  break;
              }

              break;

            case "+":
              item.text = `+${item.text}`;

              switch (str[item.index - 3]) {
                case "+":
                  item.text = `+${item.text}`;
                  break;
              }

              break;
          }

          break;
      }

      switch (str[item.index + 1]) {
        case ".":
          item.text = `${item.text}.`;

          switch (str[item.index + 2]) {
            case ".":
              item.text = `${item.text}.`;
              break;
          }

          break;
      }
    });
    let notes = result.map(item => {
      return item.text;
    });
    let time = [];
    notes.forEach((item, index) => {
      time.push(this.handleString(notes, index));
    });
    return time.sort()[0];
  }

  handleString(song, offset) {
    let letter = song[offset].match(/[0-9]/g)[0];
    let subKey = song[offset].split("-").length - 1;
    let addKey = song[offset].split("+").length - 1;
    let pointKey = song[offset].split(".").length - 1;
    let halfKey = song[offset].split("#").length - 1;
    let note;
    let key;
    let time;

    switch (letter) {
      case "0":
        return (time = 1000);
        break;

      case "1":
        note = "C";
        break;

      case "2":
        note = "D";
        break;

      case "3":
        note = "E";
        break;

      case "4":
        note = "F";
        break;

      case "5":
        note = "G";
        break;

      case "6":
        note = "A";
        break;

      case "7":
        note = "B";
        break;
    }

    switch (subKey) {
      case 0:
        key = 4;
        break;

      case 1:
        key = 3;
        break;

      case 2:
        key = 2;
        break;
    }

    switch (addKey) {
      case 0:
        key = 4;
        break;

      case 1:
        key = 5;
        break;

      case 2:
        key = 6;
        break;
    }

    switch (pointKey) {
      case 0:
        time = 500;
        break;

      case 1:
        time = 1000;
        break;

      case 2:
        time = 1500;
        break;
    }

    console.log(`${note + (halfKey > 0 ? "#" : "") + key}`);
    this.playNote(`${note + (halfKey > 0 ? "#" : "") + key}`);
    return time;
  }

  recordSong() {}
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

    /*当屏幕尺寸小于600px时，应用下面的CSS样式*/
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
    /* 隐藏音符显示 */
    /* font-size: 8px; */
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

  /* .btn:not(:disabled):not(.disabled) {
    cursor: pointer;
  } */

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
    /* white-space: nowrap; */
    vertical-align: middle;
    /* -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none; */
    border: 1px solid #17a2b8;
    padding: 8px 8px;
    font-size: 16px;
    line-height: 16px;
    border-radius: 2.5px;
    /* transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out; */
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
