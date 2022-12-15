const {entities: {VPackage: VPackageStore}} = require('#store');
const Downloader = require('./downloader');
const PendingPromise = require('@beyond-js/pending-promise');
const Files = require('./files');
const File = require('./files/file');

module.exports = class {
    #pkg;
    #version;
    #store;

    #found;
    get found() {
        return this.#found;
    }

    #files;
    get files() {
        return this.#files;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return this.#found && !this.#error;
    }

    #processing;
    get processing() {
        return this.#processing;
    }

    #processed;
    get processed() {
        return this.#processed;
    }

    constructor(pkg, version) {
        if (!pkg || !version) throw new Error('Invalid parameters');

        this.#pkg = pkg;
        this.#version = version;
        this.#files = new Files(pkg, version);
        this.#store = new VPackageStore(pkg, version);
    }

    #promise;

    async process() {
        if (this.#promise) return await this.#promise;
        this.#promise = new PendingPromise();

        await this.#store.load();
        const stored = this.#store.value?.files;
        if (stored) {
            this.#processing = !!stored.processing;
            this.#processed = !!stored.processed;
            this.#found = stored.found;
            this.#error = stored.error;
            this.#files.hydrate(stored.files);

            this.#promise.resolve();
            return;
        }

        /**
         * Set in the store that the vpackage is being processed to avoid processing the same vpackage more than once
         */
        this.#processing = true;
        this.#processed = false;
        await this.#store.set({files: {processing: true}});

        /**
         * Download the vpackage
         */
        const downloader = new Downloader(this.#pkg, this.#version);
        await downloader.process();
        const {valid, found, error, files} = downloader;

        /**
         * Save the meta information to the store and
         * create the files objects that are responsible to make its downloads
         */
        this.#processed = true;
        this.#processing = false;
        this.#found = found;
        this.#error = error;
        valid && files.forEach(info => this.#files.set(info.path, new File(this.#pkg, this.#version, info)));

        const store = {processed: true, found};
        valid && (store.files = this.#files.toJSON());
        error && (store.error = error);
        await this.#store.set({files: store});

        this.#promise.resolve();
    }
}
