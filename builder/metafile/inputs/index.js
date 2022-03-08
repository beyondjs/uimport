const Input = require('./input');

module.exports = class extends Map {
    constructor(metafile) {
        super();

        Object.entries(metafile.inputs).forEach((([path, meta]) => {
            if (this.has(path)) throw new Error(`Input "${path}" is not expected to be duplicated in esbuild metafile`);
            this.set(path, new Input(metafile.inputs, path, meta));
        }));
    }
}
