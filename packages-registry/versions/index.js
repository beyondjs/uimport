const satisfies = require('semver/functions/satisfies.js');
const PackageVersion = require('./version');

module.exports = class {
    #pkg;

    /**
     * All the versions numbers contained in the package
     * @type {string[]}
     */
    #versions = [];

    /**
     * The instances of the versions returned by the get method
     * @type {Map<string, any>}
     */
    #items = new Map();

    /**
     * The versions object as it was received from the NPM registry API
     * @type {Map<any, any>}
     */
    #data = new Map();

    constructor(pkg) {
        this.#pkg = pkg;
    }

    #get(version) {
        if (this.#items.has(version)) return this.#items.get(version);

        const data = this.#data.get(version);
        const item = new PackageVersion(this.#pkg, {version: version, json: data});
        this.#items.set(version, item);
        return item;
    }

    async get(version) {
        await this.#pkg.load();
        if (!this.#pkg.valid) return;

        const resolved = this.#versions.find(v => satisfies(v, version));
        if (!resolved) return;

        const item = this.#get(resolved);
        await item.load();
        return item;
    }

    /**
     * Set the version object when fetched from the NPM registry API
     * @param versions {Record<string, *>}
     */
    set(versions) {
        const previous = this.#versions;

        this.#versions.length = 0;
        versions = versions ? Object.values(versions).reverse() : [];

        versions.forEach(data => {
            if (previous.includes(data.version)) return;

            this.#data.set(data.version, data);
            this.#versions.push(data.version);
        });
    }

    async save() {
        const promises = [];
        this.#versions.forEach(vnumber => promises.push(this.#get(vnumber).save()));
        await Promise.all(promises);
    }

    hydrate(cached) {
        this.#versions = cached ? cached : [];
    }

    toJSON() {
        return this.#versions;
    }
}