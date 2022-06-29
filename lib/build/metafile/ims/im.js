module.exports = class {
    // ex: '../node_modules/react/dist/react.development.js'
    #input;
    get input() {
        return this.#input;
    }

    // The location of the node_modules path relative to the application path
    // ex: node_modules
    // ex: node_modules/hoist-non-react-statics/node_modules
    #root;
    get root() {
        return this.#root;
    }

    // ex: 'react'
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    // The location of the package
    // ex: node_modules/hoist-non-react-statics/node_modules/react-is
    #location;
    get location() {
        return this.#location;
    }

    // ex: 'dist/react.development.js'
    #file;
    get file() {
        return this.#file;
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

    #ims;
    #consumers;
    get consumers() {
        if (this.#consumers !== void 0) return this.#consumers;

        const consumers = new Set();
        this.#ims.forEach(im => {
            const {imports} = im;
            const paths = imports.map(({path}) => path);
            paths.includes(this.#input) && consumers.add(im);
        });
        return this.#consumers = consumers;
    }

    #error;
    get error() {
        return this.#error;
    }

    /**
     * Input constructor
     *
     * @param input {string} The path of the input being constructed (ex: ../node_modules/react/dist/react.development.js)
     * @param meta {object} The esbuild metadata of the input
     * @param ims {object} The ims collection
     */
    constructor(input, meta, ims) {
        this.#input = input;
        this.#meta = meta;
        this.#ims = ims;

        const {root, resource} = (() => {
            const split = `/${input}`.split('/node_modules/');

            const resource = split.pop();
            split.push('');

            // The location path where the node_modules folder that contains the package is located
            let root = split.join('/node_modules/');
            root = root.slice(1, root.length - 1);

            return {root, resource};
        })();
        this.#root = root;

        const {pkg, file} = (() => {
            const split = resource.split('/');
            const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
            const file = split.join('/');
            return {pkg, file};
        })();
        this.#pkg = pkg;

        this.#location = `${root}/${pkg}`;
        this.#file = file;

        if (root.startsWith('..')) {
            // Check that the package is installed in the application path (not a parent path)
            this.#error = `Package "${pkg}" not found`;
        }
    }
}
