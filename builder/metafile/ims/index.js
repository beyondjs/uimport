const IM = require('./im');

module.exports = class extends Map {
    constructor(metafile, application) {
        super();

        Object.entries(metafile.inputs).forEach((([input, meta]) => {
            if (input === 'input.js') return; // The entry point of the bundle

            const im = new IM(metafile.inputs, input, meta, this, application);
            if (this.has(im.path)) {
                throw new Error(`Input "${im.input}" is not expected to be duplicated in esbuild metafile`);
            }

            this.set(im.path, im);
        }));
    }
}
