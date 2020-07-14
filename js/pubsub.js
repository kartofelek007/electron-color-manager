export default {
    subscribers : {},

    subscribe(canalName, fn) {
        if (this.subscribers[canalName] === undefined) {
            this.subscribers[canalName] = [];
        }
        this.subscribers[canalName].push(fn);
    },

    emit(canalName, data) {
        if (this.subscribers[canalName] !== undefined)
            this.subscribers[canalName].forEach(s => s(data));
    },

    saveToStorage() {
        localStorage.setItem(
            "options",
            JSON.stringify(this.opts)
        );
    }
}