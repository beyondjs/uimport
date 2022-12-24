const packages = require('@beyond-js/uimport/packages-registry');
const satisfies = require('semver/functions/satisfies.js');
const DependenciesConfig = require('../config');

module.exports = class {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #version;
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
        this.#version = version;
        this.#internals = internals;
    }

    async process() {
        const vname = `${this.#pkg}@${this.#version}`;

        /**
         * Check if it is an dependency of an internal package
         */
        if (this.#internals.has(vname)) {
            const internal = this.#internals.get(vname);
            const {version: v, dependencies, devDependencies, peerDependencies} = internal;

            /**
             * Check if the version of the internal package satisfy the version specified in the dependency
             */
            if (!satisfies(v, this.#version)) {
                this.#error = `Internal dependency does not satisfies version "${v}"`;
                return;
            }

            this.#dependencies = new DependenciesConfig({dependencies, devDependencies, peerDependencies});
            return;
        }

        /**
         * Look up the dependency in the NPM registry
         */
        const vpackage = await packages.get(this.#pkg).versions.get(this.#version);
        if (vpackage?.valid) {
            this.#dependencies = vpackage.dependencies;
        }
        else {
            this.#error = vpackage?.error || `Dependency version "${this.#version}" cannot be satisfied`;
        }
    }
}
