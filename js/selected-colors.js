import copyTextToClipboard from "./utils/clipboard.js";
import { colorBright, hexToRgb, rgbToHex } from "./utils/colors.js";
import pubsub from "./pubsub.js";
import options from "./options.js";

class SelectedColors {
    constructor() {
        this.selectedColorsElement = document.querySelector("#selectedColors");

        pubsub.on("colorSelect", () => {
            this.createSelectedColorsElement();
        });
    }

    copyColorsToClipboard(colors) {
        const qt = options.opts.quote.status?'"':'';
        const cm = options.opts.comma.status?',':'';
        const nl = options.opts.newLine.status?'\n':'';
        const char = `${qt}${cm}${nl}${qt}`;

        if (options.opts.rgba.status) {
            colors = colors.map(hexToRgb).map(el => {
                return `rgba(${el.r},${el.g},${el.b},1)`;
            });
        }

        if (colors) {
            copyTextToClipboard(`${qt}${colors.join(char)}${qt}`);
        }
    }

    createSelectedColorsElement(colors) {
        this.selectedColorsElement.innerHTML = "";
        this.selectedColorsElement.classList.remove("show");

        if (colors.length) {
            this.selectedColorsElement.classList.add("show");
            colors.forEach(el => {
                const div = document.createElement("div");
                div.style.background = el;
                if (colors.length > 1) {
                    div.innerHTML = `
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"/></svg></span>
                    `;
                    div.title = "Usuń kolor";
                    if (colorBright(el) > 100) {
                        div.querySelector("svg").style.fill = "#000";
                    }
                    div.addEventListener("click", e => {
                        const that = e.currentTarget;
                        const children = that.parentElement.children;
                        const index = [...children].findIndex(el => el === that);
                        colors.splice(index, 1);
                        pubsub.emit("colorsSelected");
                    })
                }
                this.selectedColorsElement.append(div);
            })
        }
    }
}

export default new SelectedColors;