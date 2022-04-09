const IM = require('./im');

module.exports = class extends Map {
    #errors;
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor(metafile) {
        super();
        const errors = [];
        this.#errors = errors;

        const entries = Object.entries(metafile.inputs);

        entries.forEach(([input, meta]) => {
            if (!input.startsWith('node_modules/')) return; // Is is the entry point of the bundle

            const im = new IM(input, meta, this);
            im.error ? errors.push(im.error) : this.set(input, im);
        });
    }
}
