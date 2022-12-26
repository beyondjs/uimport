const packages = require('@beyond-js/uimport/packages-registry');
const satisfies = require('semver/functions/satisfies.js');
const DependenciesConfig = require('../config');

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
        const vname = `${this.#pkg}@${this.#version.declared}`;

        /**
         * Check if it is an dependency of an internal package
         */
        if (this.#internals.has(vname)) {
            const internal = this.#internals.get(vname);
            const {version: v, dependencies, devDependencies, peerDependencies} = internal;

            /**
             * Check if the version of the internal package satisfy the version specified in the dependency
             */
            if (!satisfies(v, this.#version.declared)) {
                this.#error = `Internal dependency does not satisfies version "${v}"`;
                return;
            }

            this.#version.resolved = v;
            this.#dependencies = new DependenciesConfig({dependencies, devDependencies, peerDependencies});
            return;
        }

        /**
         * Look up the dependency in the NPM registry
         */
        const vpackage = await packages.get(this.#pkg).versions.get(this.#version.declared);
        if (vpackage?.valid) {
            this.#version.resolved = vpackage.version;
            this.#dependencies = vpackage.dependencies;
        }
        else {
            this.#error = vpackage?.error || `Dependency version "${this.#version.declared}" cannot be satisfied`;
        }
    }
}
