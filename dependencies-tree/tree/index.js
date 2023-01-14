const TreeData = require('./data');
const Dependency = require('./dependency');
const DependenciesConfig = require('./config');
const Store = require('./store');
const PendingPromise = require('@beyond-js/pending-promise');

module.exports = class extends Map {
    #store;
    #internals;

    #list = new Map();
    get list() {
        return this.#list;
    }

    #errors;
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors?.length;
    }

    #warnings;
    get warnings() {
        return this.#warnings;
    }

    #loaded;
    get loaded() {
        return this.#loaded;
    }

    #config;

    /**
     * Dependencies tree constructor
     *
     * @param application? {string} The identifier of the application: `${account}/${name}`
     * @param json {*} The configuration of the dependencies when it refers to an application
     * @param pkg? {string} The package name
     * @param version? {string} The version of the package
     * @param internals? {<string, {dependencies: *, devDependencies: *, peerDependencies: *}>} The internal packages
     */
    constructor({application, json, pkg, version, internals}) {
        super();

        if (application && !json) {
            throw new Error('json parameter is expected when application parameter is set');
        }
        if (!application && (!pkg || !version)) {
            throw new Error('Application parameter or pkg and version must be specified');
        }
        if (application && (pkg || version)) {
            throw new Error('Invalid parameters, pkg/version should not be specified when application is set');
        }

        this.#internals = internals = internals ? internals : new Map();
        this.#config = new DependenciesConfig({application, json, pkg, version, internals});
        this.#store = new Store({application, pkg, version, internals});
    }

    /**
     * Dump the processed properties of the data object
     * @param data
     */
    #dump(data) {
        this.#loaded = true;
        this.#errors = !data.valid ? data.errors : [];

        this.clear();
        data.tree.forEach((value, specifier) => this.set(specifier, value));
        data.list.forEach((info, vpkg) => this.#list.set(vpkg, info));
    }

    async #load() {
        /**
         * Process dependencies configuration and check if it is valid
         */
        await this.#config.process({update: false});
        if (!this.#config.valid) {
            this.#errors = this.#config.errors;
            return;
        }
        const config = this.#config;

        /**
         * Load dependencies tree from store
         */
        await this.#store.load();
        const {dependenciesTree, hash} = (() => {
            const {dependenciesTree: value} = this.#store.value ? this.#store.value : {dependenciesTree: {}};
            const {processed: dependenciesTree, hash} = value;
            return {dependenciesTree, hash};
        })();

        if (!dependenciesTree || hash !== config.hash) return;

        const data = new TreeData();
        const tree = JSON.parse(dependenciesTree);

        data.hydrate(tree);
        this.#dump(data);
    }

    #promise;

    /**
     * Process the dependencies tree
     *
     * @param specs {{update: boolean, logger: *}}
     * @return {Promise<void>}
     */
    async process(specs) {
        if (!specs) throw new Error('Invalid parameters');

        if (this.#promise) return await this.#promise;
        this.#promise = new PendingPromise();

        const done = ({error}) => {
            this.#errors = error ? [error] : [];
            this.log(error ? error : 'Dependencies tree is processed');
            this.#promise.resolve();
        }

        specs = specs ? specs : {};
        const {logger} = specs;

        await this.#config.process(specs);
        const config = this.#config;
        if (!config.valid) {
            const errors = JSON.stringify(config.errors);
            return done({error: `Dependencies configuration errors found: ${errors}`});
        }

        if (!specs.update) {
            !this.#loaded && await this.#load();
            if (!this.#loaded) return done({error: `Dependencies tree is not processed`});
            return done({});
        }

        if (this.#loaded) return;

        /**
         * The already processed dependencies tree of a package, required to resolve circular dependencies
         * @type {Map<string, Map<string, *>>}
         */
        const already = new Map();

        /**
         * Recursively find the dependencies
         * @param dependencies
         * @return {Promise<Map<string, *>>}
         */
        const recursive = async dependencies => {
            const {vpkg: vname} = dependencies;
            if (already.has(vname)) return already.get(vname);

            const output = new Map();
            already.set(vname, output);

            for (const [name, {kind, version}] of dependencies) {
                if (kind === 'development') continue;

                const done = ({version, dependencies, error}) => {
                    error ? output.set(name, {error}) : output.set(name, {version, dependencies});
                }

                const dependency = new Dependency(name, version, this.#internals);
                await dependency.process({logger});
                if (dependency.error) {
                    done(({error: dependency.error}));
                    continue;
                }

                const dependencies = await recursive(dependency.dependencies);
                done({version: dependency.version.resolved, dependencies});
            }
            return output;
        }

        const data = new TreeData();
        data.tree = await recursive(config);

        // Tree is stored as a string as firestore object cannot be deeper than 20 levels
        const {hash} = config;
        await this.#store.set({dependenciesTree: {hash, processed: JSON.stringify(data.toJSON())}});

        this.#dump(data);
    }

    /**
     * Return the dependencies tree as a recursive object instead a recursive map
     * @return {{}}
     */
    get object() {
        const recursive = branch => {
            const output = {};
            [...branch].forEach(([name, {version, dependencies}]) => {
                return output[`${name}@${version}`] = dependencies ? recursive(dependencies) : {};
            });
            return output;
        }

        return recursive(this);
    }

    get optimized() {

    }
}
