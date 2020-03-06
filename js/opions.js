export let options = {
    opts : {
        newLine : {status: false, textInMenu: "Znak nowej linii"},
        comma   : {status: false, textInMenu: "Przecinek między kolorami"},
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
        console.log(JSON.stringify(this.opts));
        localStorage.setItem(
            "options",
            JSON.stringify(this.opts)
        );
        console.log(localStorage.getItem("options"));
    },

    loadFromStorage() {
        const loadData = localStorage.getItem("options");
        if (loadData !== null) {
            console.log(loadData);
            console.log(JSON.parse(loadData));
            this.opts = JSON.parse(loadData);
            console.log(this.opts);
        }
    }
}