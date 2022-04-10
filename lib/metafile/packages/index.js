const packages = require('uimport/packages');

module.exports = class extends Map {
    #ims;
    #paths;

    #errors;
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor(ims, paths) {
        super();
        this.#ims = ims;
        this.#paths = paths;
    }

    #promise;

    async process() {
        if (this.#promise) return await this.#promise.value;
        this.#promise = Promise.pending();

        const errors = [];
        this.#errors = errors;

        for (const im of this.#ims.values()) {
            const cwd = require('path').join(this.#paths.cwd, im.location);
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
