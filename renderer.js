import { saveColorsToFile } from "./js/saveToFile.js";
import { rgbToHex } from "./js/utils/colors.js";
import { optionsPub } from "./js/options.js";
import { copyColorsToClipboard, createSelectedColorsElement, selectedColorsPub } from "./js/selected-colors.js";
import { attachNewColor } from "./js/palette.js";

const { ipcRenderer } = require("electron");

ipcRenderer.on('pickedColor', function(event , data) {
    const color = data.color;
    const hexColor = rgbToHex(color[0], color[1], color[2]);
    attachNewColor(hexColor);
    saveColorsToFile();
});

optionsPub.subscribe(() => {
    copyColorsToClipboard();
    optionsPub.saveToStorage();
});

selectedColorsPub.subscribe(() => {
    createSelectedColorsElement();
    copyColorsToClipboard();
})

optionsPub.loadFromStorage(); //poczatkowe wczytanie







