module.exports = new class {
    /**
     * Once the store is requested for the first time, then it must not be replaced with a new one
     * @type {boolean}
     */
    #initialised = false;

    get entities() {
        return this.store.entities;
    }

    get storage() {
        return this.store.storage;
    }

    get Logger() {
        return this.store.Logger;
    }

    #store;
    get store() {
        if (!this.#initialised) throw new Error('Store not initialised');
        return this.#store;
    }

    initialise(value) {
        if (this.#initialised) throw new Error('Store cannot be replaced after it was previously obtained');
        this.#initialised = true;
        this.#store = value ? value : require('./store');
    }
}
