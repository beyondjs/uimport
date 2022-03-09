const IM = require('./im');

module.exports = class extends Map {
    constructor(metafile, absWorkingDir, entryPoint) {
        super();

        Object.entries(metafile.inputs).forEach((([input, meta]) => {
console.log(input, entryPoint, input.endsWith(entryPoint))
            if (input.endsWith(entryPoint)) return; // The entry point of the bundle

            const im = new IM(metafile.inputs, input, meta, this, absWorkingDir);
            if (this.has(im.path)) {
                throw new Error(`Input "${im.input}" is not expected to be duplicated in esbuild metafile`);
            }

            this.set(im.path, im);
        }));
    }
}
