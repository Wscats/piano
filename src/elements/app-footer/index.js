import { WeElement, define, h } from "omi";
import moon from "../app-piano/songs/moon.js";
import keys from "./keys.js";

class AppFooter extends WeElement {
  constructor(...args) {
    super(...args);

    this.setSong = song => this.store.setSong(song);
  }

  render(props) {
    return h(
      "div",
      {
        class: "app-footer"
      },
      h("hr", {
        class: "mt-5"
      }),
      h(
        "div",
        {
          class: "row mt-5"
        },
        h(
          "div",
          {
            class: "col"
          },
          h(
            "div",
            {
              class: "text-center"
            },
            h(
              "p",
              {
                class: "mt-4"
              },
              "You can click on the keyboard and play the melody that belongs to you. Here is an example of a piano piece:"
            ),
            h(
              "p",
              null,
              "\u4F60\u53EF\u4EE5\u70B9\u51FB\u952E\u76D8\u4F9D\u987A\u5E8F\u6309\u4EE5\u4E0B\u952E\uFF0C\u63A7\u5236\u597D\u8282\u594F\u6F14\u594F\u5C5E\u4E8E\u4F60\u7684\u65CB\u5F8B\uFF0C\u4E0B\u9762\u662F\u4E00\u9996\u94A2\u7434\u66F2\u7684\u4F8B\u5B50:"
            ),
            h(
              "p",
              {
                class: "mt-4"
              },
              "Enjoy it!"
            ),
            this.store.data.song.map(item => {
              if (item[0].note) {
                return h(
                  "p",
                  {
                    class: "mt-3 code"
                  },
                  h(
                    "code",
                    {
                      class: "p-2 text-dark"
                    },
                    item.map(item2 => {
                      if (item2.note) {
                        return h(
                          "span",
                          {
                            style: {
                              color:
                                this.store.data.count === item2.index
                                  ? "red"
                                  : "black"
                            }
                          },
                          this.data.keys[item2.note],
                          ","
                        );
                      }
                    })
                  )
                );
              }
            })
          )
        )
      ),
      h(
        "div",
        {
          class: "bg-yellow mt-5 py-5"
        },
        h(
          "div",
          {
            class: "container"
          },
          h(
            "div",
            {
              class: "text-center text-secondary"
            },
            "Made with ",
            h(
              "span",
              {
                role: "img",
                "aria-label": "keyboard emoji"
              },
              "\uD83C\uDFB5"
            ),
            "by ",
            h(
              "a",
              {
                class: "text-secondary",
                href: "https://github.com/Wscats"
              },
              h("strong", null, "@Eno Yao")
            )
          )
        )
      )
    );
  }

  install() {
    this.data = {
      title: "omi",
      song: [],
      keys
    };
    this.setSong(moon);
  }
}

AppFooter.css = `hr{margin:0 50px;border:0;border-top-color:currentcolor;border-top-style:none;border-top-width:0px;border-top:1px solid rgba(0,0,0,0.1)}hr{box-sizing:content-box;height:0;overflow:visible}.bg-yellow{background-color:#f8e8d5}.container{line-height:50px;height:50px;width:100%;margin-right:auto;margin-left:auto}.text-secondary{color:#6c757d !important}.text-center{text-align:center !important}.code{padding:0 250px}@media screen and (max-width: 1000px){.code{padding:0 20px}}code{overflow:hidden;background-color:#ececec;width:100%;display:block;padding:10px 0}`;
AppFooter.use = [
  {
    count: "count",
    song: "song"
  }
];
define("app-footer", AppFooter);
