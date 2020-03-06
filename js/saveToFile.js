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
    try {
    fs.writeFileSync(fileUrl, JSON.stringify(json));
    } catch (err) {
        alert("Wystąpił błąd w czasie zapisu", err);
    }
}

export const readColorsFromFile = function() {
    try {
        const rawData = fs.readFileSync(fileUrl);
        const json = JSON.parse(rawData);
        return [...json.colors];
    } catch (err) {
        return [];
    }
}