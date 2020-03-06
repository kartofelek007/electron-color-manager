import copyTextToClipboard from "./utils/clipboard.js";
import { optionsPub } from "./options.js";
import { colorBright, hexToRgb, rgbToHex } from "./utils/colors.js";

const selectedColorsElement = document.querySelector("#selectedColors");
export const selectedColorsPub = {
    colors : [],
    subscribers : [],

    clear() {
        this.colors.length = 0;
    },

    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    },

    emit() {
        this.subscribers.forEach(s => s());
    }
};

const copyColorsToClipboard = function() {
    const qt = optionsPub.opts.quote.status?'"':'';
    const cm = optionsPub.opts.comma.status?',':'';
    const nl = optionsPub.opts.newLine.status?'\n':'';
    const char = `${qt}${cm}${nl}${qt}`;

    let colors = [...selectedColorsPub.colors];

    if (optionsPub.opts.rgba.status) {
        colors = colors.map(hexToRgb).map(el => {
            return `rgba(${el.r},${el.g},${el.b},1)`;
        });
    }

    if (selectedColorsPub.colors.length) {
        copyTextToClipboard(`${qt}${colors.join(char)}${qt}`);
    }
}

const createSelectedColorsElement = function() {
    selectedColorsElement.innerHTML = "";
    selectedColorsPub.colors.forEach(el => {
        const div = document.createElement("div");
        div.style.background = el;
        if (selectedColorsPub.colors.length > 1) {
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
                selectedColorsPub.colors.splice(index, 1);
                selectedColorsPub.emit();
            })
        }
        selectedColorsElement.append(div);
    })
}

export { copyColorsToClipboard, createSelectedColorsElement };