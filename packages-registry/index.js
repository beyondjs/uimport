const Package = require('./package');

module.exports = new class {
    #items = new Map();

    /**
     * Returns a single instance of a package
     *
     * @param name {string} The name of the package
     * @return {*}
     */
    get(name) {
        if (this.#items.has(name)) return this.#items.get(name);

        const item = new Package(name);
        this.#items.set(name, item);
        return item;
    }
}
