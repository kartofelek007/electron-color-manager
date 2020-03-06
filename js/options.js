export let optionsPub = {
    opts : {
        newLine : {status: false, textInMenu: "Znak nowej linii"},
        comma   : {status: false, textInMenu: "Przecinek pomiędzy kolorami"},
        quote   : {status: false, textInMenu: "Kolory w cudzysłowach"},
        rgba    : {status: false, textInMenu: "Kolory jako RGBA"}
    },

    subscribers : [],

    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    },

    emit() {
        this.subscribers.forEach(s => s());
    },

    saveToStorage() {
        localStorage.setItem(
            "options",
            JSON.stringify(this.opts)
        );
    },

    loadFromStorage() {
        const loadData = localStorage.getItem("options");
        if (loadData !== null) {
            this.opts = JSON.parse(loadData);
        }
        this.emit();
    }
}