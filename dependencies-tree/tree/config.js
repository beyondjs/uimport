const DependenciesConfig = require('../config');
const registry = require('@beyond-js/uimport/packages-registry');
const PendingPromise = require('@beyond-js/pending-promise');

module.exports = class extends Map {
    #config;

    #json;
    #application;
    get application() {
        return this.#application;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #version;
    get version() {
        return this.#version;
    }

    #internals

    #is;
    /**
     * What the dependencies tree refers to
     * @return {'application' | 'package' | 'internal'}
     */
    get is() {
        return this.#is;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #errors;
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor({application, json, pkg, version, internals}) {
        super();

        this.#application = application;
        this.#json = json;
        this.#pkg = pkg;
        this.#version = version;
        this.#internals = internals;
    }

    #promise;

    /**
     * Create the dependencies tree configuration object
     *
     * @param specs {{update: boolean}}
     * @return {Promise<*|void|*>}
     */
    async process(specs) {
        if (this.#promise) return await this.#promise;
        this.#promise = new PendingPromise();

        const done = ({config, is, errors}) => {
            this.#config = config;
            this.#errors = errors ? errors : [];
            this.#is = is;

            if (!config) {
                this.#promise.resolve();
                return;
            }

            config.forEach((value, key) => this.set(key, value));
            this.#promise.resolve();
        }

        /**
         * Application dependencies
         */
        if (this.#application) {
            const {dependencies, devDependencies, peerDependencies} = this.#json;
            const config = new DependenciesConfig({dependencies, devDependencies, peerDependencies});
            return done({config, is: 'application'});
        }

        /**
         * Check if it is an internal package
         */
        const internal = this.#internals.get(this.#pkg)?.versions.obtain(this.#version);
        if (internal) return done({config: internal.dependencies, is: 'internal'})

        /**
         * look for the package configuration in the npm registry
         */
        const pkg = registry.get(this.#pkg);
        await pkg.load({fetch: specs.update}); // Fetch package from registry if not previously fetched
        const {valid, found, loaded, error} = pkg;

        if (!found) return done({errors: [`Package "${this.#pkg}" not found`]});
        if (!valid) return done({errors: [`Error found on package "${this.#pkg}": ${error}`]});
        if (!loaded) return done({errors: [`Package "${this.#pkg}" hasn't been installed`]});

        const vpackage = await pkg.versions.get(this.#version);
        if (!vpackage) {
            const versions = pkg.versions.values;
            const error = `Version "${this.#version}" of package "${this.#pkg}" not found. ` +
                `Current versions are "${versions}"`
            return done({errors: [error]});
        }
        await vpackage.load();
        done({config: vpackage.dependencies, is: 'package'});
    }
}
