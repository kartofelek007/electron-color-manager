const electron = require('electron');
const {ipcRenderer} = require('electron');
const remote = electron.remote;
const size = remote.getCurrentWindow().webContents.getOwnerBrowserWindow().getBounds();

import {ScreenCapture} from "./js/utils/ScreenCapture.js";
const sc = new ScreenCapture();

const canvas1 = document.querySelector("#mainCanvas");
const canvas2 = document.querySelector("#optCanvas");
canvas1.width = size.width;
canvas1.height = size.height;
canvas2.width = size.width;
canvas2.height = size.height;

const ctx1 = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");

const drawColor = function(color) {
    const size = 120;
    const draw = {
        x : canvas2.width - size - 20,
        y : canvas2.height - size - 20,
        size : size
    }
    ctx2.save();
    ctx2.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx2.lineWidth = 5;
    ctx2.strokeStyle = "rgba(255, 255, 255, 1)";
    ctx2.strokeRect(draw.x, draw.y, size, size);
    ctx2.fillRect(draw.x, draw.y, size, size);

    ctx2.textAlign = "left";
    ctx2.textBaseline = "top";
    ctx2.font = "bold 13px sans-serif";
    ctx2.lineWidth = 2;
    ctx2.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx2.fillStyle = "#FFF"
    ctx2.strokeText("PICK COLOR", draw.x + 5, draw.y + 5);
    ctx2.fillText("PICK COLOR", draw.x + 5, draw.y + 5);

    ctx2.restore();
}

const drawLines = function(mouseX, mouseY, img) {
    const size = 4;
    const fix = 0.5;
    ctx2.save();
    ctx2.strokeStyle = "rgba(100, 100, 100, 0.6)";
    //x
    // ctx2.beginPath();
    // ctx2.moveTo(0, mouseY);
    // ctx2.lineTo(fix + mouseX - size, fix + mouseY);
    // ctx2.stroke();

    // ctx2.beginPath();
    // ctx2.moveTo(fix + mouseX + size, fix + mouseY);
    // ctx2.lineTo(canvas2.width, fix + mouseY);
    // ctx2.stroke();

    // //y
    // ctx2.beginPath();
    // ctx2.moveTo(fix + mouseX, 0);
    // ctx2.lineTo(fix + mouseX, fix + mouseY - size);
    // ctx2.stroke();

    // ctx2.beginPath();
    // ctx2.moveTo(fix + mouseX, fix + mouseY + size);
    // ctx2.lineTo(fix + mouseX, canvas2.height);
    // ctx2.stroke();

    // //circle
    // ctx2.beginPath();
    // ctx2.arc(mouseX, mouseY, size, 0, 2 * Math.PI);
    // ctx2.stroke();

    ctx2.drawImage(img, mouseX - 2, mouseY - 30);

    ctx2.restore();
}

const drawZoom = function(mouseX, mouseY) {
    const size = 120;
    const zoom = 3;
    const fix = 0.5;

    ctx2.imageSmoothingEnabled = false;
    ctx2.mozImageSmoothingEnabled = false;
    ctx2.webkitImageSmoothingEnabled = false;
    ctx2.msImageSmoothingEnabled = false;
    ctx2.imageSmoothingEnabled = false;

    ctx2.save();

    const source = {
        x : mouseX - (size / zoom / 2),
        y : mouseY - (size / zoom / 2),
        size : size / zoom
    }

    const draw = {
        x : canvas2.width - size - 20,
        y : canvas2.height - size * 2 - 20 * 2,
        size: size
    }

    ctx2.lineWidth = 5;
    ctx2.strokeStyle = "rgba(255, 255, 255, 1)";
    ctx2.strokeRect(draw.x, draw.y, draw.size, draw.size);
    ctx2.drawImage(
        canvas1,
        source.x, source.y, source.size, source.size, //source
        draw.x, draw.y, draw.size, draw.size, //dest
    );
    //line Y
    ctx2.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx2.lineWidth = 1;
    ctx2.beginPath();
    ctx2.moveTo(fix + draw.x + draw.size / 2, fix + draw.y);
    ctx2.lineTo(fix + draw.x + draw.size / 2, fix + draw.y + draw.size);
    ctx2.stroke();
    //line X
    ctx2.beginPath();
    ctx2.moveTo(fix + draw.x, fix+ draw.y + draw.size / 2);
    ctx2.lineTo(fix + draw.x + draw.size, fix + draw.y + draw.size / 2);
    ctx2.stroke();

    ctx2.textAlign = "left";
    ctx2.textBaseline = "top";
    ctx2.font = "bold 13px sans-serif";
    ctx2.lineWidth = 2;
    ctx2.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx2.fillStyle = "#FFF"
    ctx2.strokeText("ZOOM", draw.x + 5, draw.y + 5);
    ctx2.fillText("ZOOM", draw.x + 5, draw.y + 5);
    ctx2.restore();
}

const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
        resolve(img);
    }
    img.src = "./images/dropper-icon.png";
    if (img.complete) img.dispatchEvent(new Event("load"));
})

Promise.all([sc.capture(), p]).then(([canvasFromSC, img]) => {
    ctx1.drawImage(canvasFromSC, 0, 0, canvas1.width, canvas1.height, 0, 0, canvas1.width, canvas1.height);

    canvas1.addEventListener("mousemove", e => {
        const pixelData = [...ctx1.getImageData(e.offsetX, e.offsetY, 1, 1).data];
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        drawColor(pixelData);
        drawLines(e.offsetX, e.offsetY, img);
        drawZoom(e.offsetX, e.offsetY);
    })

    canvas1.addEventListener("click", e => {
        const pixelData = [...ctx1.getImageData(e.offsetX, e.offsetY, 1, 1).data];
        console.log(pixelData);
        ipcRenderer.send('colorPicked', pixelData );
        const window = remote.getCurrentWindow();
        window.close();
    })

    document.addEventListener("keyup", e => {
        if (e.key === "Escape") {
            const window = remote.getCurrentWindow();
            window.close();
        }
    })
})