import { WeElement, define, h } from "omi";
import notes from "./notes.js";

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
        "button",
        {
          onClick: this.playSong.bind(this)
        },
        "\u6708\u4EAE\u4EE3\u8868\u6211\u7684\u5FC3 \u64AD\u653E"
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
            keyCode: null
          }
        },
        {
          white: {
            name: `D${item}`,
            keyCode: 50
          },
          black: {
            name: `D#${item}`,
            keyCode: null
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
            keyCode: null
          }
        },
        {
          white: {
            name: `G${item}`,
            keyCode: 53
          },
          black: {
            name: `G#${item}`,
            keyCode: null
          }
        },
        {
          white: {
            name: `A${item}`,
            keyCode: 54
          },
          black: {
            name: `A#${item}`,
            keyCode: null
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
      var e = event || window.event || arguments.callee.caller.arguments[0];

      let playNote = key => {
        if (e.shiftKey === true) {
          this.playNote(`${key}5`);
        } else if (e.ctrlKey === true) {
          this.playNote(`${key}3`);
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

  playSong() {
    let song = [
      {
        note: "G3",
        time: 500
      },
      {
        note: "C4",
        time: 1000
      },
      {
        note: "E4",
        time: 500
      },
      {
        note: "G4",
        time: 1000
      },
      {
        note: "C4",
        time: 500
      },
      {
        note: "B3",
        time: 1000
      },
      {
        note: "E4",
        time: 500
      },
      {
        note: "G4",
        time: 1500
      },
      {
        note: "G4",
        time: 500
      },
      {
        note: "A4",
        time: 1000
      },
      {
        note: "B4",
        time: 500
      },
      {
        note: "C5",
        time: 1000
      },
      {
        note: "A4",
        time: 500
      },
      {
        note: "G4",
        time: 1500
      },
      {
        note: "E4",
        time: 500
      },
      {
        note: "D4",
        time: 500
      },
      {
        note: "C4",
        time: 1000
      },
      {
        note: "C4",
        time: 500
      },
      {
        note: "C4",
        time: 500
      },
      {
        note: "E4",
        time: 500
      },
      {
        note: "D4",
        time: 500
      },
      {
        note: "C4",
        time: 1000
      },
      {
        note: "C4",
        time: 500
      },
      {
        note: "C4",
        time: 500
      },
      {
        note: "D4",
        time: 500
      },
      {
        note: "E4",
        time: 500
      },
      {
        note: "D4",
        time: 500
      },
      {
        note: "C4",
        time: 1000
      },
      {
        note: "A3",
        time: 500
      },
      {
        note: "D4",
        time: 500
      },
      {
        note: "E4",
        time: 500
      },
      {
        note: "D4",
        time: 500
      }
    ];
    let offset = 0;

    let playSong = async () => {
      if (offset < song.length) {
        this.playNote(song[offset]["note"]);
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, song[offset]["time"]);
        });
        offset++;
        playSong();
      } else {
        return;
      }
    };

    playSong();
  }
}

AppPiano.css = `
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
