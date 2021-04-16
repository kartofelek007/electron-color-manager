export default {
    subscribers : {},

    on(subject, fn) {
        if (this.subscribers[subject] === undefined) {
            this.subscribers[subject] = [];
        }
        this.subscribers[subject].push(fn);
    },

    off(subject, fn) {
        if (this.subscribers[subject] === undefined) return;
        this.subscribers[subject].filter(el => el !== fn);
    },

    emit(subject, data) {
        if (this.subscribers[subject] === undefined) return;
        this.subscribers[subject].forEach(fn => fn(data));
    },
}