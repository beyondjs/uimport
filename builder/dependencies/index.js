const External = require('./external');
const Root = require('./root');

module.exports = class extends Map {
    #bundle;
    #application;
    #ims;

    #externals;
    get externals() {
        return this.#externals;
    }

    #roots;
    get roots() {
        return this.#roots;
    }

    constructor(bundle, application, ims) {
        super();
        this.#bundle = bundle;
        this.#application = application;
        this.#ims = ims;
    }

    process() {
        const externals = this.#externals = new Map();
        this.#ims.forEach(im => {
            const external = new External(im, this.#application);
            !external.error && externals.set(external.id, external);
        });

        const roots = this.#roots = new Map();
        this.#ims.forEach(im => {
            const root = new Root(im, this.#ims, externals);
            roots.set(im.path, root);
        });
    }
}
