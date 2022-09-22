import satisfies from 'semver/functions/satisfies.js';
import fetch from 'node-fetch';

export default class Package {
    #name;
    #cache;

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    /**
     * The versions of the package ordered by published date
     */
    #versions;
    get versions() {
        return this.#versions;
    }

    /**
     * Returns the version of the package that satisfies the required version
     * @param required
     */
    version(required) {
        return this.#versions.find(({version}) => satisfies(version, required));
    }

    constructor(name, cache) {
        this.#name = name;
        this.#cache = cache;
    }

    async fetch() {
        const done = ({json, error}) => {
            if (error) {
                this.#error = error;
                return {error};
            }

            this.#versions = Object.values(json.versions).reverse();
            return {json};
        }

        const cached = await this.#cache.load(this.#name);
        if (cached) return done(cached);

        const response = await fetch(`https://registry.npmjs.org/${this.#name}`);
        if (!response.ok) return done({error: response.status});

        const json = await response.json();
        await this.#cache.save(this.#name, {json});
        return done({json});
    }
}
