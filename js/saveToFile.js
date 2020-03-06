const fs = require("fs");
const path = require("path");
const paletteElement = document.querySelector("#palette");
const fileUrl = path.resolve(__dirname, "./colors.json");

export const saveColorsToFile = function() {
    const json = {
        colors : []
    };

    const elements = paletteElement.querySelectorAll(".palette-element");
    for (const el of elements) {
        json.colors.push(el.dataset.color);
    }

    fs.writeFile(fileUrl, JSON.stringify(json), 'utf8', () => {});
}

export const readColorsFromFile = function() {
    const urlJSONFile = "./colors.json";
    const rawData = fs.readFileSync(fileUrl);
    const json = JSON.parse(rawData);
    return [...json.colors];
}