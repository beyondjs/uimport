const File = require('./file');

module.exports = class extends Map {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #version;
    get version() {
        return this.#version;
    }

    constructor(pkg, version) {
        if (!pkg || !version) throw new Error('Invalid parameters');

        super();
        this.#pkg = pkg;
        this.#version = version;
    }

    hydrate(stored) {
        stored?.forEach(data => this.set(data.path, new File(this.#pkg, this.#version, data)));
    }

    toJSON() {
        return [...this.values()].map(file => file.toJSON());
    }
}
