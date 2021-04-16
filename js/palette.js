import { saveColorsToFile, readColorsFromFile } from "./saveReadToFile.js";
import selectedColors from "./selected-colors.js";
import { colorBright } from "./utils/colors.js";
import { DragDrop } from "./utils/dragDrop.js";
import pubsub from "./pubsub.js";
import globalState from "./globalState.js";
const Selection = require("@simonwep/selection-js");

class Palette {
    constructor() {
        this.colors = [];
        this.selection = null;
        this.paletteElement = document.querySelector("#palette");
        this.createPalette();
        this.createSelection()
    }

    createPalette() {
        const colors = readColorsFromFile();
        for (const color of colors) {
            const element = this.createPaletteElement(color);
            this.paletteElement.append(element);
        }
    }

    attachNewColor(color) {
        const element = this.createPaletteElement(color);
        this.paletteElement.prepend(element);
    };

    createPaletteElement(color) {
        const div = document.createElement("div");
        div.classList.add("palette-element");
        div.style.backgroundColor = color;
        div.dataset.color = color;

        const btn = document.createElement("div");
        btn.classList.add("palette-element-delete");

        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"/></svg>`;
        btn.title = "Usuń kolor";
        btn.querySelector("svg").style.fill = colorBright(color) > 100 ? "#000" : "";
        btn.addEventListener("click", e => {
            e.currentTarget.parentElement.remove();

            const paletteElement = document.querySelector("#palette");
            const elements = paletteElement.querySelectorAll(".palette-element");
            const palette = [...elements].map(el => el.dataset.color);
            saveColorsToFile(palette);
            //pubsub.emit("colorSelect");
        });
        div.append(btn);

        return div;
    };

    createSelection() {
        //https://github.com/Simonwep/selection
        const selection = new Selection({
            class: 'selection',
            startThreshold: 10,

            singleTap: {
                allow: true,
                intersect: 'touch'
            },

            allowTouch: false,
            overlap: 'invert',
            selectables: [
                ".palette-element"
            ],
            startareas: ['html'],
            boundaries: ['html'],

            scrolling: {
                speedDivider: 10,
                manualSpeed: 750
            }
        })

        selection.on('start', ({event, store}) => {
            if (!event.ctrlKey && !event.metaKey) {
                [...paletteElement.querySelectorAll(".selected")].forEach(el => el.classList.remove("selected"));
                selection.clearSelection();
            }
        })

        selection.on('move', ({event, store}) => {
            for (const el of store.changed.added) {
                el.classList.add('selected');
            }
            for (const el of store.changed.removed) {
                el.classList.remove('selected');
            }
            globalState.colors = [...paletteElement.querySelectorAll(".selected")].map(el => el.dataset.color);
            pubsub.emit("colorsSelected");
        })

        selection.on('stop', ({event, store}) => {
            globalState.colors = [...paletteElement.querySelectorAll(".selected")].map(el => el.dataset.color);
            pubsub.emit("colorsSelected");
            selection.keepSelection();
        });

        const paletteElement = this.paletteElement;
        this.drag = new DragDrop("#palette", {
            afterDrag(el) {
                const elements = paletteElement.querySelectorAll(".palette-element");
                const palette = [...elements].map(el => el.dataset.color);
                saveColorsToFile(palette);
            },
            className : "palette-element"
        });

        pubsub.on("menuChange", (mode) => {
            if (mode === "manage") {
                this.paletteElement.classList.add("palette-manage");
                selection.disable();
                selection.clearSelection();
                paletteElement.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
                globalState.colors = [];
                pubsub.emit("colorsSelect");
                this.drag.initDraggable();
            } else {
                this.paletteElement.classList.remove("palette-manage");
                selection.enable();
                this.drag.removeDraggable();
            }
        });
    }
}

export default new Palette;








