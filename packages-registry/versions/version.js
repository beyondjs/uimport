const {entities: {VPackage: VPackageStore}} = require('#store');
const {DependenciesConfig} = require('../../dependencies-tree');
const Exports = require('./exports');
const PendingPromise = require('@beyond-js/pending-promise');

module.exports = class {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #store;
    get store() {
        return this.#store;
    }

    #version;
    get version() {
        return this.#version;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #exports;
    get exports() {
        return this.#exports;
    }

    #browser;
    get browser() {
        return this.#browser;
    }

    #uimport;
    get uimport() {
        return this.#uimport;
    }

    #loaded;
    get loaded() {
        return this.#loaded;
    }

    #promise;

    constructor(pkg, {version, json, error}) {
        this.#pkg = pkg;

        this.#version = version;
        !error && json && this.#set(json);
        this.#error = error;

        if (!this.#version) throw new Error('Package version number must be specified');

        this.#store = new VPackageStore(pkg, version);
    }

    #set(json) {
        this.#loaded = true;

        this.#version = json.version;
        this.#dependencies = new DependenciesConfig(json);
        this.#exports = new Exports(json);
        this.#uimport = json.uimport;
        this.#browser = json.browser;
    }

    #hydrate(values) {
        this.#loaded = true;
        this.#version = values.version;

        this.#error = values.error;
        if (this.#error) return;

        this.#dependencies = (() => {
            const dependencies = new DependenciesConfig();
            dependencies.hydrate(values.dependencies);
            return dependencies;
        })();
        this.#exports = (() => {
            const exports = new Exports();
            exports.hydrate(values.exports);
            return exports;
        })();
        this.#uimport = values.uimport;
        this.#browser = values.browser;
    }

    toJSON() {
        const {valid, error, version, dependencies, exports, uimport, browser} = this;
        if (!valid) return {version, error};

        const json = {version};
        json.dependencies = dependencies.toJSON();
        json.exports = exports.toJSON();
        json.uimport = uimport;
        json.browser = browser;
        return json;
    }

    /**
     * The information of each version of the package is stored at the moment of the fetch of the package.
     * Check the package's .load method.
     *
     * @return {Promise<void>}
     */
    async load() {
        if (this.#loaded) return;
        if (this.#promise) return await this.#promise;
        this.#promise = new PendingPromise();

        if (!this.#version) throw new Error('Package name must be set before loading tha package');

        const done = () => {
            this.#promise.resolve();
            this.#promise = void 0;
            this.#loaded = true;
        }

        await this.#store.load();
        if (!this.#store.value) return done();

        this.#hydrate(this.#store.value);
        done();
    }

    async save() {
        if (!this.#loaded) throw new Error(`Version object cannot be saved because it hasn't be set`);
        return await this.#store.save(this.toJSON());
    }
}
