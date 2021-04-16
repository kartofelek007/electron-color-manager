const { ipcRenderer } = require("electron");
import options from "./options.js";
import pubsub from "./pubsub.js";
import globalState from "./globalState.js";

class Menu {
    constructor() {
        this.bindBtnManageMenu();
        this.bindBtnAddNewColor();
        this.createSubmenuWithOptions();
    }

    bindBtnAddNewColor() {
        const btnAdd = document.querySelector("#menuAdd");
        btnAdd.addEventListener("click", e => {
            const res = ipcRenderer.send('createColorPickWindow', {});
        });
    }

    bindBtnManageMenu() {
        const manageBtn = document.querySelector('#menuManage');
        manageBtn.addEventListener("click", e => {
            manageBtn.classList.toggle("active");
            const mode = (manageBtn.classList.contains("active"))? "manage" : "normal";
            pubsub.emit("menuChange", mode);
        });
    }

    createInput(key) {
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
            pubsub.emit("optionsChange", options.opts);
        });
        return div
    }

    createSubmenuWithOptions() {
        const optionsSubmenuElement = document.querySelector('#menuSubmenu');
        const keys = Object.keys(options.opts);
        for (const key of keys) {
            optionsSubmenuElement.append(this.createInput(key));
        }

        pubsub.on("optionsChange", () => {
            optionsSubmenuElement.querySelectorAll("input").forEach(el => {
                el.checked = options.opts[el.dataset.key].status
            });
        });

        const menuToggle = document.querySelector("#menuCopySetup");
        menuToggle.addEventListener("click", e => {
            e.currentTarget.classList.toggle("active");
            optionsSubmenuElement.classList.toggle("show");
        });
    }
}

export default new Menu;



