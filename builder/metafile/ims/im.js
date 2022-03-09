module.exports = class {
    #application;
    #ims;

    // ex: '../node_modules/react/dist/react.development.js'
    #input;
    get input() {
        return this.#input;
    }

    // The node_modules path, relative to the working directory
    // ex: '..'
    #root;
    get root() {
        return this.#root;
    }

    // ex: 'react'
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    get container() {
        return this.external.error ? this.#pkg : this.external.id;
    }

    // ex: 'react/dist/react.development.js'
    #path;
    get path() {
        return this.#path;
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

    // Who imports the current input
    #consumers;
    get consumers() {
        if (this.#consumers !== void 0) return this.#consumers;

        return this.#consumers = (() => {
            const consumers = new Set();
            this.#ims.forEach(im => {
                const {imports} = im;
                const paths = imports.map(({path}) => path);
                paths.includes(this.#input) && consumers.add(im);
            });
            return consumers;
        })();
    }

    #external;
    get external() {
        if (this.#external !== void 0) return this.#external;
        return this.#external = new (require('./external'))(this, this.#application);
    }

    /**
     * Input constructor
     *
     * @param inputs {object} The inputs as they were received from the esbuild metafile
     * @param input {string} The path of the input being constructed (ex: ../node_modules/react/dist/react.development.js)
     * @param meta {object} The esbuild metadata of the input
     * @param ims {object} The internal modules collection
     * @param application {object} The application object
     */
    constructor(inputs, input, meta, ims, application) {
        this.#input = input;
        this.#meta = meta;
        this.#ims = ims;
        this.#application = application;

        const [root, resource] = input.replace('/node_modules/', '//').split('//');
        this.#root = `${root}/node_modules`;
        this.#path = resource;

        const split = resource.split('/');
        this.#pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
        this.#file = split.join('/');
    }
}
