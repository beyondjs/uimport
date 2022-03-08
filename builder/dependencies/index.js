module.exports = class {
    #metafile;

    #externals;
    get externals() {
        return this.#externals;
    }

    constructor(metafile) {
        this.#metafile = metafile;
    }

    async process() {

    }
}
