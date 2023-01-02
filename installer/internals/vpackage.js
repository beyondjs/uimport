const DependenciesConfig = require('../../dependencies-tree/config');

module.exports = class {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #version;
    get version() {
        return this.#version;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    constructor(pkg, version, json) {
        this.#pkg = pkg;
        this.#version = version;
        this.#dependencies = new DependenciesConfig(json);
    }
}
