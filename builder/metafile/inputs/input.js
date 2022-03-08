module.exports = class {
    #path;
    get path() {
        return this.#path;
    }

    #meta;
    get meta() {
        return this.#meta;
    }

    // Who imports the current input
    #importers;
    get importers() {
        if (this.#importers !== void 0) return this.#importers;

        return this.#importers = (() => {
            const importers = new Set();
            Object.entries(inputs).forEach(([importer, {imports}]) => {
                imports = imports.map(({path}) => path);
                imports.includes(path) && importers.add(importer);
            });
            return importers;
        })();
    }

    /**
     * Input constructor
     *
     * @param inputs {object} The inputs as they were received from the esbuild metafile
     * @param path {string} The path of the input being constructed
     * @param meta {object} The esbuild metadata of the input
     */
    constructor(inputs, path, meta) {
        this.#path = path;
        this.#meta = meta;
    }
}
