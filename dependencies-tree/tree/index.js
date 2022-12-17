const {entities: {Package: PackageStore, Application: ApplicationStore}} = require('#store');
const packages = require('@beyond-js/uimport/packages-registry');
const DependenciesConfig = require('../config');
const TreeData = require('./data');

module.exports = class extends Map {
    #config;
    #store;

    #id;
    get id() {
        return this.#id;
    }

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
     * @param id? {string}
     */
    constructor({application, pkg, version, json}) {
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
        if (!this.#store.value?.dependenciesTree) {
            this.#loaded = false;
            return;
        }

        const data = new TreeData();
        const tree = JSON.parse(this.#store.value.dependenciesTree);
        data.hydrate(tree);
        this.#dump(data);
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

                const done = ({vpackage, dependencies, error}) => {
                    if (error) {
                        output.set(name, {error});
                        return;
                    }

                    const {version} = vpackage;
                    output.set(name, {version, dependencies});
                }

                /**
                 * Look up the dependency in the NPM registry
                 * Do not move the packages require to the beginning of the file to avoid a circular dependency
                 */
                const vpackage = await packages.get(name).versions.get(version);
                if (!vpackage?.valid) {
                    const error = vpackage?.error || `Dependency version "${version}" cannot be satisfied`;
                    done(({error}));
                    continue;
                }

                const dependencies = await recursive(vpackage.dependencies);
                done({vpackage, dependencies});
            }
            return output;
        }

        const data = new TreeData();
        data.tree = await recursive(this.#config);

        // Tree is stored as a string as firestore object cannot be deeper than 20 levels
        await this.#store.set({dependenciesTree: JSON.stringify(data.toJSON())});
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
