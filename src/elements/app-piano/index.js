import { WeElement, define, h } from "omi";
import notes from "./notes.js";
import moon from "./songs/moon.js";
import fuji from "./songs/fuji.js";
import "omiu/button";

class AppPiano extends WeElement {
  render(props) {
    return h(
      "div",
      null,
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
        "o-button",
        {
          onClick: this.playSong.bind(this, moon),
          style: "margin-top:20px; width:280px;"
        },
        "\u70B9\u51FB\u5F39\u594F\uFF1A\u6708\u4EAE\u4EE3\u8868\u6211\u7684\u5FC3"
      ),
      h(
        "o-button",
        {
          onClick: this.playSong.bind(this, fuji),
          style: "margin-top:20px; width:280px;"
        },
        "\u70B9\u51FB\u5F39\u594F\uFF1A\u5BCC\u58EB\u5C71\u4E0B&\u7231\u60C5\u8F6C\u79FB"
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

  playNote(name) {
    let audio = this[name].childNodes[1];
    this[name].style.background = `linear-gradient(-30deg, #616161, #fff)`;
    let timer = setTimeout(() => {
      this[name].getAttribute("data-type") === "white"
        ? (this[
            name
          ].style.background = `linear-gradient(-30deg, #f8f8f8, #fff)`)
        : (this[
            name
          ].style.background = `linear-gradient(-20deg, #222, #000, #222)`);
      clearInterval(timer);
    }, 1000);
    audio.currentTime = 0;
    audio.play();
  }

  playSong(song) {
    let offset = 0;
    let time = 0;

    let playSong = async () => {
      if (offset < song.length) {
        switch (typeof song[offset]) {
          case "string":
            time = this.handleObject(song, offset);
            break;

          case "object":
            console.log(song[offset]["note"]);
            time = song[offset]["time"];
            this.playNote(song[offset]["note"]);
            break;
        }

        await new Promise(resolve => {
          let timer = setTimeout(() => {
            clearInterval(timer);
            resolve();
          }, time);
        });
        offset++;
        playSong();
      } else {
        return;
      }
    };

    playSong();
  }

  handleObject(song, offset) {
    let letter = song[offset].match(/[0-9]/g)[0];
    let subKey = song[offset].split("-").length - 1;
    let addKey = song[offset].split("+").length - 1;
    let pointKey = song[offset].split(".").length - 1;
    let note;
    let key;
    let time;

    switch (letter) {
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

    console.log(note + key);
    this.playNote(`${note + key}`);
    return time;
  }

  recordSong() {}
}

AppPiano.css = `
  * {
    margin: 0;
    padding: 0;
  }

  .piano {
    background: linear-gradient(-65deg, #000, #222, #000, #666, #222 75%);
    border-top: .8rem solid #282828;
    -webkit-box-shadow: inset 0 -1px 1px hsla(0, 0%, 100%, .5), inset -0.4rem 0.4rem #282828;
    box-shadow: inset 0 -1px 1px hsla(0, 0%, 100%, .5), inset -0.4rem 0.4rem #282828;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    height: 80vh;
    height: 60vh;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    overflow: hidden;
    padding-bottom: 5%;
    padding-left: 2.5%;
    padding-right: 2.5%;
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
    font-size: 8px;
    text-align: center;
    height: 20px;
  }
`;
define("app-piano", AppPiano);
