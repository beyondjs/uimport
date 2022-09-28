module.exports = class {
    #json;
    get json() {
        return this.#json;
    }

    get version() {
        return this.#json.version;
    }

    constructor(json) {
        this.#json = json;
    }
}