import { saveColorsToFile, readColorsFromFile } from "./saveToFile.js";
import { selectedColorsPub, createSelectedColorsElement } from "./selected-colors.js";
import { colorBright } from "./utils/colors.js";
import { menuPub } from "./menu.js";
import { DragDrop } from "./utils/dragDrop.js";

const colors = readColorsFromFile();
export const paletteElement = document.querySelector("#palette");

export const attachNewColor = function(color) {
    const element = createPaletteElement(color);
    paletteElement.prepend(element);
}

export const createPaletteElement = function(color) {
    const div = document.createElement("div");
    div.classList.add("palette-element");
    div.style.backgroundColor = color;
    div.dataset.color = color;

    const btn = document.createElement("div");
    btn.classList.add("palette-element-delete");

    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"/></svg>`;
    btn.title = "Usuń kolor";
    if (colorBright(color) > 100) {
        btn.querySelector("svg").style.fill = "#000";
    }
    btn.addEventListener("click", e => {
        e.currentTarget.parentElement.remove();

        const paletteElement = document.querySelector("#palette");
        const elements = paletteElement.querySelectorAll(".palette-element");
        const palette = [...elements].map(el => el.dataset.color);
        saveColorsToFile(palette);
        selectedColorsPub.emit();
    });
    div.append(btn);

    return div;
}

selectedColorsPub.subscribe(() => {
    createSelectedColorsElement();
})

//https://github.com/Simonwep/selection
const Selection = require("@simonwep/selection-js");
const selection = new Selection({
    class: 'selection',
    frame: document,
    startThreshold: 10,
    disableTouch: false,
    mode: 'touch',
    tapMode: 'native',
    singleClick: true,
    selectables: [
        ".palette-element"
    ],
    startareas: ['html'],
    boundaries: ['html'],
    selectionAreaContainer: 'body',
    scrollSpeedDivider: 10,
    manualScrollSpeed: 750
}).on('start', ({inst, selected, oe}) => {
    if (!oe.ctrlKey && !oe.metaKey) {
        for (const el of selected) {
            el.classList.remove('selected');
            inst.removeFromSelection(el);
        }
        inst.clearSelection();
    }
}).on('move', ({changed: {removed, added}}) => {
    for (const el of added) {
        el.classList.add('selected');
    }
    for (const el of removed) {
        el.classList.remove('selected');
    }
    selectedColorsPub.colors = [...paletteElement.querySelectorAll(".selected")].map(el => el.dataset.color)
    selectedColorsPub.emit();

}).on('stop', ({inst}) => {
    inst.keepSelection();
});

for (const color of colors) {
    const element = createPaletteElement(color);
    paletteElement.append(element);
}

const drag = new DragDrop('#palette', {
    afterDrag(el) {
        const paletteElement = document.querySelector("#palette");
        const elements = paletteElement.querySelectorAll(".palette-element");
        const palette = [...elements].map(el => el.dataset.color);
        saveColorsToFile(palette);
    },
    className : "palette-element"
});

menuPub.subscribe(() => {
    if (menuPub.mode === "manage") {
        palette.classList.add("palette-manage");
        selection.disable();
        selection.clearSelection()
        paletteElement.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
        selectedColorsPub.clear();
        selectedColorsPub.emit();
        drag.initDraggable();
    } else {
        palette.classList.remove("palette-manage");
        selection.enable();
        drag.removeDraggable();
    }
})