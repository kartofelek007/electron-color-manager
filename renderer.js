import { saveColorsToFile } from "./js/saveReadToFile.js";
import { rgbToHex } from "./js/utils/colors.js";
import selectedColors from "./js/selected-colors.js";
import palette from "./js/palette.js";
import pubsub from "./js/pubsub.js";
import globalState from "./js/globalState.js";
import options from "./js/options.js";
import menu from "./js/menu.js";
const { ipcRenderer } = require("electron");

ipcRenderer.on('pickedColor', function(event , data) {
    const color = data.color;
    const hexColor = rgbToHex(color[0], color[1], color[2]);
    palette.attachNewColor(hexColor);
    const paletteElement = document.querySelector("#palette");
    const elements = paletteElement.querySelectorAll(".palette-element");
    const colorsPelette = [...elements].map(el => el.dataset.color);
    saveColorsToFile(colorsPelette);
});

pubsub.subscribe("optionsChange", (optionsValues) => {
    selectedColors.copyColorsToClipboard(globalState.colors);
    options.saveToStorage();
});

pubsub.subscribe("colorsSelected", () => {
    selectedColors.createSelectedColorsElement(globalState.colors);
    selectedColors.copyColorsToClipboard(globalState.colors);
});

options.loadFromStorage(); //poczatkowe wczytanie







