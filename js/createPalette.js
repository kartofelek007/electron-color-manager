import copyToClipboard from "./utils/clipboard.js";
import colorBrightness from "./utils/colorBrightness.js";
import { saveColorsToFile, readColorsFromFile } from "./saveToFile.js";
import {DragDrop} from "./utils/dragDrop.js";
import {hexToRgb, rgbToHex} from "./utils/colors.js";
import {options} from "./opions.js";

const colors = readColorsFromFile();
let selectedColors = []; //wybrane kolory

const paletteElement = document.querySelector("#palette");

options.loadFromStorage(); //poczatkowe wczytanie
options.subscribe(function() {
    copyColors();
    options.saveToStorage();
})

const copyColors = function() {
    const qt = options.opts.quote.status?'"':'';
    const cm = options.opts.comma.status?',':'';
    const nl = options.opts.newLine.status?'\n':'';
    const char = `${qt}${cm}${nl}${qt}`;

    let colors = [...selectedColors];

    if (options.opts.rgba.status) {
        colors = colors.map(hexToRgb).map(el => {
            return `rgba(${el.r},${el.g},${el.b},1)`;
        });
    }

    if (selectedColors.length) {
        copyToClipboard(`${qt}${colors.join(char)}${qt}`);
    }
}


const selectedColorsElement = document.querySelector("#selectedColors");

const createSelected = function() {
    selectedColorsElement.innerHTML = "";
    selectedColors.forEach(el => {
        const div = document.createElement("div");
        div.style.background = el;
        if (selectedColors.length > 1) {
            div.innerHTML = `
                <span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"/></svg></span>
            `;
            div.title = "Usuń kolor";
            if (colorBrightness(el) > 100) {
                div.querySelector("svg").style.fill = "#000";
            }
            div.addEventListener("click", e => {
                const that = e.currentTarget;
                const children = that.parentElement.children;
                const index = [...children].findIndex(el => el === that);
                selectedColors.splice(index, 1);
                createSelected();
            })
        }
        selectedColorsElement.append(div);
    })
    copyColors();
}

const createColorElement = function(color) {
    const div = document.createElement("div");
    div.classList.add("palette-element");
    div.style.backgroundColor = color;
    div.dataset.color = color;

    const btn = document.createElement("div");
    btn.classList.add("palette-element-delete");

    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"/></svg>`;
    btn.title = "Usuń kolor";
    if (colorBrightness(color) > 100) {
        btn.querySelector("svg").style.fill = "#000";
    }
    btn.addEventListener("click", e => {
        e.currentTarget.parentElement.remove();
        createSelected();
        saveColorsToFile();
    })
    div.append(btn);

    return div;
}


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
    selectedColors = [...paletteElement.querySelectorAll(".selected")].map(el => el.dataset.color)
    createSelected();
}).on('stop', ({inst}) => {
    inst.keepSelection();
});


for (const color of colors) {
    const element = createColorElement(color);
    paletteElement.append(element);
}



//---------------------------------------
//MENU
//---------------------------------------
const manageBtn = document.querySelector('#menuManage');
const drag = new DragDrop('#palette', {
    afterDrag(el) {
        saveColorsToFile();
    },
    className : "palette-element"
});

const clearSelected = function() {
    selectedColors = [];
    selection.clearSelection()
    paletteElement.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
    createSelected();
}

manageBtn.addEventListener("click", e => {
    palette.classList.toggle("palette-manage");
    if (palette.classList.contains("palette-manage")) {
        selection.disable();
        clearSelected();
        drag.initDraggable();
        selectedColorsElement.style.display = "none";
    } else {
        selection.enable();
        drag.removeDraggable();
        selectedColorsElement.style.display = "";
    }
});

const optionsSubmenuElement = document.querySelector('#optionsSubmenu');
const keys = Object.keys(options.opts);
for (const key of keys) {
    const div = document.createElement("div");
    div.innerHTML = `
        <div class="menu-submenu-element">
            <label class="menu-submenu-label">
                <input type="checkbox" data-key="${key}">
                <span>
                    ${options.opts[key].textInMenu}
                </span>
            </label>
        </div>
    `;
    const input = div.querySelector("input");
    input.checked = options.opts[key].status;
    input.addEventListener("change", e => {
        options.opts[key].status = e.target.checked;
        options.emit();
    });
    optionsSubmenuElement.append(div);
}


const menuToggle = document.querySelector("#menuCopySetup");
menuToggle.addEventListener("click", e => {
    e.currentTarget.classList.toggle("active");
    optionsSubmenuElement.classList.toggle("show");
})

const { ipcRenderer } = require("electron");

ipcRenderer.on('pickedColor', function(event , data) {
    const color = data.color;
    const hexColor = rgbToHex(color[0], color[1], color[2]);
    const element = createColorElement(hexColor);
    paletteElement.append(element);
    saveColorsToFile();
});

const btnAdd = document.querySelector("#menuAdd");
btnAdd.addEventListener("click", e => {
    const res = ipcRenderer.send('createColorPickWindow', {});
});
