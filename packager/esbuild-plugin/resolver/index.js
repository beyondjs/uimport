const packages = require('@beyond-js/cloud-functions/packages-registry');
const SpecifierParser = require('@beyond-js/specifier-parser');
const Dependency = require('./dependency');
const NameSpace = require('./namespace');
const Importer = require('./importer');
const {join, dirname, sep} = require('path');

module.exports = class {
    #plugin;
    #args;

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    #namespace;
    /**
     * The resolved namespace of the specifier being imported according to the dependencies tree
     * @return {NameSpace}
     */
    get namespace() {
        return this.#namespace;
    }

    #external;
    /**
     * Is it an external module (export of a package) that has not to be imported in the dependency graph
     * of the graph being built
     * @return {boolean}
     */
    get external() {
        return this.#external;
    }

    #orphan;
    /**
     * When the specifier being imported is from an external package, but the exports are not defined, or the specifier
     * does not comply any of the exports defined in it
     * @return {boolean}
     */
    get orphan() {
        return this.#orphan;
    }

    #path;
    /**
     * The absolute path of the file that resolves for the resource being imported
     * It is undefined if the specifier is an external module (export of a package)
     * @return {string}
     */
    get path() {
        return this.#path;
    }

    #importer;
    /**
     * The namespace and path that is importing the required specifier
     * @return {{namespace: string, path: string}}
     */
    get importer() {
        return this.#importer;
    }

    #kind;
    get kind() {
        return this.#kind;
    }

    constructor(plugin, args) {
        this.#plugin = plugin;
        this.#args = args;
    }

    async process() {
        const args = this.#args;
        const kind = this.#kind = args.kind;

        /**
         * The entry point
         */
        if (kind === 'entry-point') {
            const {pkg, version, subpath} = this.#plugin.packager.vspecifier;
            const vpkg = await packages.get(pkg).versions.get(version);
            if (!vpkg.exports.has(subpath)) return;

            const {platform} = this.#plugin.packager;
            this.#namespace = new NameSpace({pkg, version});
            this.#path = (() => {
                const done = path => {
                    if (platform !== 'browser') return path;
                    const {browser} = vpkg;
                    return typeof browser === 'object' && browser[path] ? browser[path] : path;
                }

                const path = vpkg.exports.get(subpath);
                if (typeof path === 'string') return done(path);
                return done(path[platform] ? path[platform] : path.default);
            })();

            return;
        }

        const importer = this.#importer = new Importer(args.namespace, args.importer);
        if (!this.#importer.valid) {
            this.#error = this.#importer.error;
            return;
        }

        /**
         * A relative internal module
         */
        if (args.path.startsWith('.')) {
            const path = './' + join(dirname(importer.path), args.path);
            this.#path = sep !== '/' ? path.replace(/\\/g, '/') : path;
            this.#namespace = new NameSpace({value: args.namespace});
            return;
        }

        /**
         * It is a non-relative specifier, find the vspecifier according to the dependencies tree
         */
        const specifier = new SpecifierParser(args.path);
        const dependency = new Dependency(this.#plugin.packager, specifier, importer);
        await dependency.process();

        if (!dependency.valid) {
            this.#error = dependency.error;
            return;
        }

        const namespace = this.#namespace = dependency.namespace;
        const vpackage = await packages.get(namespace.pkg).versions.get(namespace.version);
        if (!vpackage) {
            this.#error = `Package "${namespace.vpkg}" not found`;
            return;
        }

        this.#external = vpackage.exports.has(specifier.subpath);
        this.#path = this.#external ? void 0 : vpackage.exports.get(specifier.subpath);
    }
}
