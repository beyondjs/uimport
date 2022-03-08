module.exports = class {
    // The node_modules path, relative to the working directory
    #root;
    get root() {
        return this.#root;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    // The path of the internal module relative to the node_module path
    #path;
    get path() {
        return this.#path;
    }

    #meta;
    get meta() {
        return this.#meta;
    }

    get imports() {
        return this.#meta.imports;
    }

    get bytes() {
        return this.#meta.bytes;
    }

    // Who imports the current input
    #consumers;
    get consumers() {
        if (this.#consumers !== void 0) return this.#consumers;

        return this.#consumers = (() => {
            const consumers = new Set();
            Object.entries(this.#meta.inputs).forEach(([consumer, {imports}]) => {
                imports = imports.map(({path}) => path);
                imports.includes(this.#path) && consumers.add(consumer);
            });
            return consumers;
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
        const [root, input] = path.split('/node_modules/');

        this.#root = `${root}/node_modules`;

        const split = input.split('/');
        this.#pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
        this.#path = split.join('/');

        this.#meta = meta;
    }
}
