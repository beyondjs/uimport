module.exports = class {
    #account;
    get account() {
        return this.#account;
    }

    #name;
    get name() {
        return this.#name;
    }

    constructor(account, name) {
        this.#accuont = account;
        this.#name = name;
    }

    async load() {
    }

    async save() {
    }
}
