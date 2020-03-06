const fs = require("fs");
const path = require("path");

import copyToClipboard from "./utils/clipboard.js";
import colorBrightness from "./utils/colorBrightness.js";
import { saveColorsToFile, readColorsFromFile } from "./saveToFile.js";
import {DragDrop} from "./utils/dragDrop.js";
import {hexToRgb, rgbToHex} from "./utils/colors.js";
import {options} from "./opions.js";

options.loadFromStorage(); //poczatkowe wczytanie

const colors = readColorsFromFile();
let addKeyPress = false; //podczas naciskania ctrl lub shift mozna wybierac kikla kolorów
let selectedColors = []; //wybrane kolory

const paletteElement = document.querySelector("#palette");

options.subscribe(function() {
    copyColors();
    options.saveToStorage();
})

document.addEventListener("keydown", e => {
    addKeyPress = e.ctrlKey || e.shiftKey;
})

document.addEventListener("keyup", e => {
    addKeyPress = e.ctrlKey || e.shiftKey;
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
        console.log(`${qt}${colors.join(char)}${qt}`);
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
        }
        selectedColorsElement.append(div);
        div.addEventListener("click", e => {
            const that = e.currentTarget;
            const children = that.parentElement.children;
            const index = [...children].findIndex(el => el === that);
            selectedColors.splice(index, 1);
            createSelected();
        })
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
        saveColorsToFile();
    })
    div.append(btn);

    div.addEventListener('click', function() {
        if (!palette.classList.contains("palette-manage")) {
            //this.classList.add('selected');
            if (!addKeyPress) {
                selectedColors = [];
            }

            if (selectedColors.length === 0) {
                selectedColors.push(this.dataset.color);
            }
            if (selectedColors[selectedColors.length-1] !== this.dataset.color) {
                selectedColors.push(this.dataset.color);
            }
            createSelected();
        }
    });

    return div;
}

export default function() {
    for (const color of colors) {
        const element = createColorElement(color);
        paletteElement.append(element);
    }
}



//MENU
//---------------------------------------
const manageBtn = document.querySelector('#menuManage');
const drag = new DragDrop('#palette', {
    afterDrag(el) {
        saveColorsToFile();
    },
    className : "palette-element"
});

manageBtn.addEventListener("click", e => {
    palette.classList.toggle("palette-manage");
    if (palette.classList.contains("palette-manage")) {
        drag.initDraggable();
        selectedColorsElement.style.display = "none";
    } else {
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
