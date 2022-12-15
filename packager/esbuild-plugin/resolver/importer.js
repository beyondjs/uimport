const NameSpace = require('./namespace');

module.exports = class {
    #namespace;
    get namespace() {
        return this.#namespace;
    }

    #path;
    /**
     * @return {string}
     */
    get path() {
        return this.#path;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    constructor(namespace, path) {
        this.#namespace = new NameSpace({value: namespace});
        this.#path = path;
        !this.#namespace.valid && (this.#error = this.#namespace.error);
    }
}
