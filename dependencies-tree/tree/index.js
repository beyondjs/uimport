const {entities: {Package: PackageStore, Application: ApplicationStore}} = require('#store');
const DependenciesConfig = require('../config');
const TreeData = require('./data');
const Dependency = require('./dependency');

module.exports = class extends Map {
    #config;
    #store;
    #internals;

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

    /**
     * Dependencies tree constructor
     * @param application? {string} The identifier of the application: `${account}/${name}`
     * @param pkg? {string} The package name
     * @param version? {string} The version of the package
     * @param json? {*} The dependencies specification
     * @param internals? {<string, {dependencies: *, devDependencies: *, peerDependencies: *}>} The internal packages
     * @param id? {string}
     */
    constructor({application, pkg, version, json, internals}) {
        super();

        if (json?.name && json?.version) {
            pkg = json.name;
            version = json.version;
        }

        if (!application && (!pkg || !version)) {
            throw new Error('Application parameter or pkg and version must be specified');
        }
        if (application && (pkg || version)) {
            throw new Error('Invalid parameters, pkg/version should not be specified when application is set');
        }

        this.#application = application;
        this.#pkg = pkg;
        this.#version = version;
        this.#internals = internals ? internals : new Map();
        this.#store = application ? new ApplicationStore(application) : new PackageStore(pkg, version);

        this.#config = (() => {
            if (!json && !pkg) return;

            json = (() => {
                if (json) return json;

                json = {dependencies: {}};
                json.dependencies[pkg] = version;
                return json;
            })();

            return new DependenciesConfig(json);
        })();
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
        const {dependenciesTree, hash} = this.#store.value ? this.#store.value : {};
        if (!dependenciesTree || hash !== this.#config.hash) {
            this.#loaded = false;
            return;
        }

        const data = new TreeData();
        const tree = JSON.parse(dependenciesTree);

        data.hydrate(tree);
        this.#dump(data);
        console.log('Dependencies tree already processed');
    }

    async process(specs) {
        specs = specs ? specs : {};
        if (!this.#config) {
            throw new Error('Dependencies cannot be processed if its json configuration is not specified');
        }

        specs.load = specs.load === void 0 ? true : specs.load;
        specs.load && await this.load();
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
        data.tree = await recursive(this.#config);

        // Tree is stored as a string as firestore object cannot be deeper than 20 levels
        const {hash} = this.#config;
        await this.#store.set({hash, dependenciesTree: JSON.stringify(data.toJSON())});
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
