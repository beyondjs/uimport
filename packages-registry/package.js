const {entities: {Package: PackageStore}} = require('#store');
const PackageVersions = require('./versions');
const PackageFetcher = require('./fetcher');
const PendingPromise = require('@beyond-js/pending-promise');

module.exports = class {
    #store;
    get store() {
        return this.#store;
    }

    #found;
    get found() {
        return this.#found;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    #name;
    get name() {
        return this.#name;
    }

    #description;
    get description() {
        return this.#description;
    }

    #homepage;
    get homepage() {
        return this.#homepage;
    }

    #license;
    get license() {
        return this.#license;
    }

    #repository;
    get repository() {
        return this.#repository;
    }

    #distTags;
    get distTags() {
        return this.#distTags;
    }

    #versions;
    get versions() {
        return this.#versions;
    }

    #fetchedTime;
    get fetchedTime() {
        return this.#fetchedTime;
    }

    constructor(pkg) {
        if (!pkg) throw new Error('Package name must be specified');

        this.#name = pkg;
        this.#versions = new PackageVersions(this);
        this.#store = new PackageStore(pkg);
    }

    #set(values) {
        this.#loaded = true;

        const {error, found} = values;
        this.#found = found;
        if (error || !found) {
            this.#error = error;
            return;
        }

        this.#description = values.description;
        this.#homepage = values.homepage;
        this.#license = values.license;
        this.#repository = values.repository;
        this.#distTags = values.distTags;
        this.#fetchedTime = values.fetchedTime;
    }

    toJSON() {
        const {valid, error, found} = this;
        if (!valid) {
            const json = {};
            error !== void 0 && (json.error = error);
            found !== void 0 && (json.found = found);
            return json;
        }

        const {name, description, homepage, license, repository, distTags, fetchedTime, versions} = this;
        const json = {found, name, description, homepage, license, repository, distTags, fetchedTime};
        json.versions = versions.toJSON();
        return json;
    }

    #hydrate(values) {
        this.#set(values);
        this.#versions.hydrate(values.versions);
    }

    #loaded;
    get loaded() {
        return this.#loaded;
    }

    #uptodate;
    get uptodate() {
        return this.#uptodate;
    }

    #promise;

    /**
     * The load method loads from the store the package properties, and the version numbers.
     * If the package is not stored in the store, then it fetch the package from the registry,
     * sets the package's properties, and since the NPM registry returns the versions data,
     * sets it to the versions object to save them all.
     *
     * @param specs {{fetch: boolean}} If property fetch is true, fetch the package if not previously fetched or outdated
     * @return {Promise<void>}
     */
    async load(specs) {
        specs = specs ? specs : {};

        if (this.#promise) return await this.#promise;
        this.#promise = new PendingPromise();

        if (!this.#name) throw new Error('Package name must be set before loading tha package');

        const done = ({loaded, uptodate}) => {
            this.#promise.resolve();
            this.#promise = void 0;
            this.#loaded = !!loaded;
            this.#uptodate = !!uptodate;
        }

        /**
         * Check if package data is stored in the store and hydrate it if so
         */
        await this.#store.load();
        if (this.#store.value) {
            /**
             * Check if package registry information is outdated
             */
            const {fetchedTime} = this.#store.value;
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            const uptodate = fetchedTime && fetchedTime > fiveMinutesAgo;

            if (uptodate) {
                this.#hydrate(this.#store.value);
                return done({loaded: true, uptodate: true});
            }
            else if (!specs.fetch) {
                return done({loaded: true, uptodate: false});
            }
        }
        if (!specs.fetch) return done({loaded: false, uptodate: false});

        const fetchedTime = Date.now();

        /**
         * As the package data is not in the store, then fetch it
         */
        const fetcher = new PackageFetcher(this.#name);
        await fetcher.fetch();

        const {valid, error, found, data} = fetcher;
        if (valid) {
            /**
             * Because the NPM registry returns full package versions data, set this data to the versions object
             * to be able to save them all to the store and to use them when any version is instantiated
             * without needing to load them from the store
             */
            data.versions && await this.#versions.set(data.versions);

            /**
             * Once the versions are saved, then save the package data
             */
            this.#set(Object.assign({fetchedTime, error, found}, data));
        }
        else {
            this.#found = found;
            this.#error = error;
        }

        /**
         * Save to the store
         */
        const json = this.toJSON();
        await this.#store.set(Object.assign({fetchedTime}, json));

        done({loaded: true});
    }
}
