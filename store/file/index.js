module.exports = class {
    #path;
    get path() {
        return this.#path;
    }

    #name;
    get name() {
        return this.#name;
    }

    constructor(path, name) {
        this.#path = path;
        this.#name = name;
    }

    async load() {

    }

    async save(content) {

    }
}
