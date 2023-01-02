const packages = require('@beyond-js/uimport/packages-registry');
require('colors');

module.exports = class {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #version = {};
    /**
     * @return {{declared: string, resolved: string}}
     */
    get version() {
        return this.#version;
    }

    #internals;

    #error;
    get error() {
        return this.#error;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    constructor(pkg, version, internals) {
        this.#pkg = pkg;
        this.#version.declared = version;
        this.#internals = internals;
    }

    async process() {
        /**
         * Check if it is an dependency of an internal package
         */
        if (this.#internals.has(this.#pkg)) {
            const {declared} = this.#version;
            const internal = this.#internals.get(this.#pkg).versions.obtain(declared);

            if (!internal) {
                const registered = JSON.stringify(this.#internals.get(this.#pkg).versions.order);
                console.log(
                    `WARNING: `.yellow +
                    `Internal package "${this.#pkg}@${declared}" not satisfied.\n` +
                    `Registered versions: ${registered}`);
            }

            /**
             * Check if the version of the internal package satisfy the version specified in the dependency
             */
            if (internal) {
                this.#version.resolved = internal.version;
                this.#dependencies = internal.dependencies;
            }
        }

        /**
         * Look up the dependency in the NPM registry
         */
        const {declared} = this.#version;
        const vpackage = await packages.get(this.#pkg).versions.get(declared);
        if (vpackage?.valid) {
            this.#version.resolved = vpackage.version;
            this.#dependencies = vpackage.dependencies;
        }
        else {
            this.#error = vpackage?.error || `Dependency version "${declared}" cannot be satisfied`;
        }
    }
}
