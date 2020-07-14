const fs = require("fs");
const path = require("path");
const { app } = require("electron").remote;
const fileUrl = app.getPath("appData") + "/" + "colors.json";
const dialog = require('electron').remote.dialog;
import defaultPalette from "./default-palette.js";

export const saveColorsToFile = function(palette) {
    try {
        fs.writeFileSync(fileUrl, JSON.stringify({colors: palette}));
    } catch (err) {
        dialog.showMessageBoxSync({
            type: "error",
            title: "Error to save in file"
        });
    }
};

export const readColorsFromFile = function() {
    try {
        const rawData = fs.readFileSync(fileUrl);
        const json = JSON.parse(rawData);
        return [...json.colors];
    } catch (err) {
        saveColorsToFile(defaultPalette);
        return [...defaultPalette];
    }
};