const NameSpace = require('./namespace');

/**
 * Resolves the vspecifier of the imported specifier according to the dependencies tree
 */
module.exports = class {
    #packager;
    #specifier;
    #importer;

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    #namespace;
    /**
     * The namespace of the specifier being imported that resolves according to the dependencies tree
     * @return {*}
     */
    get namespace() {
        return this.#namespace;
    }

    /**
     * Dependency constructor
     *
     * @param packager {*} The packager object
     * @param specifier {*} The non-relative specifier being imported
     * @param importer {{namespace: *, path: string}} The resource that is importing the specifier
     */
    constructor(packager, specifier, importer) {
        this.#packager = packager;
        this.#specifier = specifier;
        this.#importer = importer;
    }

    process() {
        const packager = this.#packager;
        const specifier = this.#specifier;
        const importer = this.#importer;

        /**
         * Check if it is a self package specifier
         */
        if (specifier.pkg === packager.specifier.pkg) {
            const {pkg, version} = packager.specifier;
            this.#namespace = new NameSpace({pkg, version});
            return;
        }

        /**
         * Get the version of the package of the specifier being required according to the dependencies tree
         */
        const version = (() => {
            const {dependencies} = packager.dependencies.get(importer.namespace.vpkg);

            /**
             * Get the list of dependencies of the package from where the specifier is being imported
             * The property dependencies.list is the complete list of vspecifiers
             * that are used across the dependencies tree
             * @type Map<string, {version, dependencies}>
             */
            const {version} = dependencies.get(specifier.pkg);
            return version;
        })();
        this.#namespace = new NameSpace({pkg: specifier.pkg, version});
    }
}
