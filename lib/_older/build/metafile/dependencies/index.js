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

    /**
     * Dependencies constructor
     *
     * @param packaging {string} The name of the bundle being packaged
     * @param ims {object} The ims collection
     * @param packages {object} The packages required by the bundle being packaged
     */
    constructor(packaging, ims, packages) {
        this.#bundles = new (require('./bundles'))(packaging, ims, packages);
        this.#files = new (require('./files'))(ims, this.#bundles);
    }
}
