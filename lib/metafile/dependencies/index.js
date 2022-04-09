module.exports = class {
    // Dependencies that are exports of an external package
    #bundles;
    get bundles() {
        return this.#bundles;
    }

    // Dependencies that are not exported on the external package
    // Ex: react/jsx-runtime, lodash
    #files;
    get files() {
        return this.#files;
    }

    constructor(ims, packages) {
        this.#bundles = new (require('./bundles'))(ims, packages);
        this.#files = new (require('./files'))(ims, this.#bundles);
    }
}
