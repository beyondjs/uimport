module.exports = class {
    #json;
    get json() {
        return this.#json;
    }

    get scope() {
        return this.#json.scope;
    }

    get name() {
        return this.#json.name;
    }

    get version() {
        return this.#json.version;
    }

    get description() {
        return this.#json.description;
    }

    #exports;
    get exports() {
        return this.#exports;
    }

    constructor(json) {
        this.#json = json;
        this.#exports = new (require('./exports'))(json);
    }
}
