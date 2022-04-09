const IM = require('./im');

module.exports = class extends Map {
    #packages;
    get packages() {
        return this.#packages;
    }

    constructor(metafile, paths) {
        super();

        Object.entries(metafile.inputs).forEach(([input, meta]) => {
            if (!input.includes('node_modules/')) return; // The entry point of the bundle

            const im = new IM(metafile.inputs, input, meta, this, paths);
            if (this.has(im.path)) {
                throw new Error(`Input "${im.input}" is not expected to be duplicated in esbuild metafile`);
            }

            this.set(im.path, im);
        });

        this.#packages = new (require('./packages'))(this);
    }
}
