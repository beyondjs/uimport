const PackageVersions = require('./versions');

module.exports = class {
    #name;
    get name() {
        return this.#name;
    }

    #versions;
    get versions() {
        return this.#versions;
    }

    constructor(name) {
        this.#name = name;
        this.#versions = new PackageVersions(name);
    }
}
