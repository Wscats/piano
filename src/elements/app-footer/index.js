import { WeElement, define, h } from "omi";

class AppFooter extends WeElement {
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
            h("h2", null, "Enjoy it!")
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
      title: "omi"
    };
  }
}

AppFooter.css = `.app-footer{margin-bottom:55px}.bg-yellow{position:fixed;z-index:10;bottom:0;width:100%;left:0}hr{margin:0 50px;border:0;border-top-color:currentcolor;border-top-style:none;border-top-width:0px;border-top:1px solid rgba(0,0,0,0.1)}hr{box-sizing:content-box;height:0;overflow:visible}.bg-yellow{background-color:#f8e8d5}.container{line-height:50px;height:50px;width:100%;padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto}.text-secondary{color:#6c757d !important}.text-center{text-align:center !important}code{padding:10px}`;
define("app-footer", AppFooter);
