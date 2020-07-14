import pubsub from "./pubsub.js";

export default {
    opts : {
        newLine: {status: false, textInMenu: "Znak nowej linii"},
        comma: {status: false, textInMenu: "Przecinek pomiędzy kolorami"},
        quote: {status: false, textInMenu: "Kolory w cudzysłowach"},
        rgba: {status: false, textInMenu: "Kolory jako RGBA"}
    },

    loadFromStorage() {
        const loadData = localStorage.getItem("options");
        if (loadData !== null) {
            this.opts = JSON.parse(loadData);
        }
        pubsub.emit("optionsChange");
    },

    saveToStorage() {
        localStorage.setItem(
            "options",
            JSON.stringify(this.opts)
        );
    }
};