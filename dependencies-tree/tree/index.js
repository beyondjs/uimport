const {entities: {VPackage: VPackageStore, Application: ApplicationStore}} = require('#store');
const registry = require('@beyond-js/uimport/packages-registry');
const TreeData = require('./data');
const Dependency = require('./dependency');
const DependenciesConfig = require('../config');

module.exports = class extends Map {
    #store;
    #internals;

    #application;
    get application() {
        return this.#application;
    }

    #json;
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

    #config;
    config = async (specs) => {
        if (!this.#pkg) {
            throw new Error('Config can only be created when the package is specified');
        }

        if (this.#config) return this.#config;

        if (this.#json) return this.#config = new DependenciesConfig(this.#json);

        /**
         * Check if it is an internal package
         */
        const internal = this.#internals.get(this.#pkg)?.versions.obtain(this.#version);
        if (internal) {
            return this.#config = internal.dependencies;
        }

        /**
         * look for the package configuration in the npm registry
         */
        const pkg = registry.get(this.#pkg);
        await pkg.load({fetch: specs.update}); // Fetch package from registry if not previously fetched
        const {valid, found, loaded, error} = pkg;
        const errors = this.#errors = [];

        if (!found) {
            errors.push(`Package "${this.#pkg}" not found`);
            return;
        }
        if (!valid) {
            errors.push(`Error found on package "${this.#pkg}": ${error}`);
            return;
        }
        if (!loaded) {
            errors.push(`Package "${this.#pkg}" hasn't been installed`);
            return;
        }

        const vpackage = await pkg.versions.get(this.#version);
        if (!vpackage) {
            const versions = pkg.versions.values;
            errors.push(`Version "${this.#version}" of package "${this.#pkg}" not found. Current versions are "${versions}"`);
            return;
        }
        await vpackage.load();
        return this.#config = vpackage.dependencies;
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
    constructor({application, json, pkg, version, internals}) {
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
        this.#json = json;
        this.#pkg = pkg;
        this.#version = version;
        this.#internals = internals ? internals : new Map();
        this.#store = application ? new ApplicationStore(application) : new VPackageStore(pkg, version);
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
        const config = await this.config({update: false});
        if (!config) return;

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
        const config = await this.config(specs);
        if (!config) return; // config is undefined if there errors were found

        const errors = this.#errors = [];
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
