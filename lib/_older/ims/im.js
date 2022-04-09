module.exports = class {
    #paths;
    #ims;

    get container() {
        const container = this.bundle.error ? this.#pkg : this.bundle.id;
        container === '@emotion/react/dist/emotion-react.esm.js' && console.log(this.bundle.error, this.#pkg, this.bundle.id);
        return this.bundle.error ? this.#pkg : this.bundle.id;
    }

    // Who imports the current input
    #consumers;
    get consumers() {
        return this.#consumers;
    }

    /**
     * The package where the im is contained
     */
    #bundle;
    get bundle() {
        if (this.#bundle !== void 0) return this.#bundle;
        return this.#bundle = new (require('./bundle'))(this, this.#paths);
    }

}
