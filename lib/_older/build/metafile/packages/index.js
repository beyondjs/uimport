const packages = require('uimport/packages');

module.exports = class extends Map {
    #ims;
    #specs;

    #errors;
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    /**
     * Metafile packages constructor
     *
     * @param ims {object} The collection of internal modules
     * @param specs {{cwd: string}}
     */
    constructor(ims, specs) {
        super();
        this.#ims = ims;
        this.#specs = specs;
    }

    #promise;

    async process() {
        if (this.#promise) return await this.#promise.value;
        this.#promise = Promise.pending();

        const errors = [];
        this.#errors = errors;
        for (const im of this.#ims.values()) {
            const cwd = require('path').join(this.#specs.cwd, im.location);
            const pkg = packages.get(im.pkg, {cwd});
            await pkg.process();

            if (pkg.error) {
                errors.push(pkg.error);
                return;
            }

            this.set(im.location, pkg);
        }

        this.#promise.resolve();

        return await this.#promise.value;
    }
}
