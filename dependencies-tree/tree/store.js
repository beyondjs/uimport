const {VPackage, VInternal, Application} = require('#store').entities;

module.exports = class {
    #store;

    get value() {
        return this.#store?.value;
    }

    constructor({application, pkg, version, internals}) {
        if (application) {
            this.#store = new Application(application);
            return;
        }

        /**
         * Check if it is an internal package
         */
        const internal = internals.get(pkg)?.versions.obtain(version);
        this.#store = internal ? new VInternal(pkg, version) : new VPackage(pkg, version);
    }

    async load() {
        return await this.#store.load();
    }

    async set(data) {
        await this.#store.set(data);
    }
}
