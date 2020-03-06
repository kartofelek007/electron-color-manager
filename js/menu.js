import { optionsPub } from "./options.js";
const { ipcRenderer } = require("electron");

export const menuPub = {
    mode : "normal",
    subscribers : [],

    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    },

    emit() {
        this.subscribers.forEach(s => s());
    },
}

//manage button
const manageBtn = document.querySelector('#menuManage');

manageBtn.addEventListener("click", e => {
    menuPub.emit();
});

//submenu
const optionsSubmenuElement = document.querySelector('#optionsSubmenu');
const keys = Object.keys(optionsPub.opts);
for (const key of keys) {
    const div = document.createElement("div");
    div.innerHTML = `
        <div class="menu-submenu-element">
            <label class="menu-submenu-label">
                <input type="checkbox" data-key="${key}">
                <span>
                    ${optionsPub.opts[key].textInMenu}
                </span>
            </label>
        </div>
    `;
    console.log(optionsPub.opts[key]);
    const input = div.querySelector("input");
    input.checked = optionsPub.opts[key].status;
    input.addEventListener("change", e => {
        optionsPub.opts[key].status = e.target.checked;
        optionsPub.emit();
    });
    optionsSubmenuElement.append(div);
}

optionsPub.subscribe(() => {
    optionsSubmenuElement.querySelectorAll("input").forEach(el => {
        el.checked = optionsPub.opts[el.dataset.key].status
    });
})

//toggle submenu
const menuToggle = document.querySelector("#menuCopySetup");
menuToggle.addEventListener("click", e => {
    e.currentTarget.classList.toggle("active");
    optionsSubmenuElement.classList.toggle("show");
})


//pick a color
const btnAdd = document.querySelector("#menuAdd");
btnAdd.addEventListener("click", e => {
    const res = ipcRenderer.send('createColorPickWindow', {});
});
