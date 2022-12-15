module.exports = new class {
    /**
     * Once the store is requested for the first time, then it must not be replaced with a new one
     * @type {boolean}
     */
    #initialised = false;

    #store;
    get store() {
        this.#initialised = true;
        return this.#store;
    }

    set store(value) {
        if (this.#initialised) throw new Error('Store cannot be replaced after it was previously obtained');
        this.#store = value;
    }
}
