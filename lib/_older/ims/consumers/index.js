/**
 * Who imports the current input
 */
module.exports = class {
    #input;
    #bundleIms;

    constructor(input, bundleIms) {
        this.#input = input;
        this.#bundleIms = bundleIms;
    }

    #ims;
    get ims() {
        if (this.#ims !== void 0) return this.#ims;

        const ims = new Set();
        this.#bundleIms.forEach(im => {
            const {imports} = im;
            const paths = imports.map(({path}) => path);
            paths.includes(this.#input) && ims.add(im);
        });
        return this.#ims = ims;
    }

    #containers;
    get containers() {
        if (this.#containers !== void 0) return this.#containers;

        const containers = new Set();
        this.ims.forEach(im => containers.add(im.container));
        return this.#containers = containers;
    }
}
