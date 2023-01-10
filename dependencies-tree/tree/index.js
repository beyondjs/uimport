const TreeData = require('./data');
const Dependency = require('./dependency');
const DependenciesConfig = require('./config');
const Store = require('./store');

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

    async load() {
        await this.#store.load();
        const {dependenciesTree, hash} = (() => {
            const {dependenciesTree: value} = this.#store.value ? this.#store.value : {dependenciesTree: {}};
            const {dependenciesTree, hash} = value;
            return {dependenciesTree, hash};
        })();

        await this.#config.process({update: false});
        if (!this.#config.valid) {
            this.#errors = this.#config.errors;
            return;
        }
        const config = this.#config;

        if (!dependenciesTree || hash !== config.hash) {
            this.#loaded = false;
            return;
        }

        const data = new TreeData();
        const tree = JSON.parse(dependenciesTree);

        data.hydrate(tree);
        this.#dump(data);
        console.log('Dependencies tree already processed');
    }

    /**
     * Process the dependencies tree
     *
     * @param specs {{update: boolean}}
     * @return {Promise<void>}
     */
    async process(specs) {
        if (!specs) throw new Error('Invalid parameters');

        specs = specs ? specs : {};
        await this.#config.process(specs);
        if (!this.#config.valid) {
            this.#errors = this.#config.errors;
            return;
        }
        const config = this.#config;

        const errors = this.#errors = [];
        void errors.length;

        if (!specs.update) {
            await this.load();
            if (!this.#loaded) {
                errors.push(`Dependencies tree must be processed before accessing it`);
                return;
            }
        }

        if (this.#loaded) return;

        /**
         * Recursively find the dependencies
         * @param dependencies
         * @return {Promise<Map<string, *>>}
         */
        const recursive = async dependencies => {
            const output = new Map();
            for (const [name, {kind, version}] of dependencies) {
                if (kind === 'development') continue;

                const done = ({version, dependencies, error}) => {
                    error ? output.set(name, {error}) : output.set(name, {version, dependencies});
                }

                const dependency = new Dependency(name, version, this.#internals);
                await dependency.process();
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
