const resolve = (require('resolve-package-path'));
const ERRORS = (require('./ERRORS'));

module.exports = class {
    #error;
    get error() {
        return this.#error;
    }

    #name;
    get name() {
        return this.#name;
    }

    #paths;

    #path;
    get path() {
        return this.#path;
    }

    #subpackages;
    get subpackages() {
        return this.#subpackages;
    }

    #subpaths;
    get subpaths() {
        return this.#subpaths;
    }

    #json;
    get json() {
        return this.#json;
    }

    get version() {
        return this.#json.version;
    }

    constructor(name, paths) {
        this.#name = name;
        this.#paths = paths;
    }

    #promise;

    async process() {
        if (this.#promise) return await this.#promise.value;
        this.#promise = Promise.pending();

        try {
            const resolved = resolve(this.#name, this.#paths.cwd);
            if (!resolved) {
                this.#error = {code: ERRORS.PACKAGE_NOT_FOUND, message: `Package "${this.#name}" not found`};
                return;
            }

            // Read the package.json
            this.#json = require(resolved);

            // The path comes with the '/package.json' in it
            this.#path = require('path').resolve(resolved, '..');

            this.#subpackages = new (require('./subpackages'))(this);
            await this.#subpackages.process();

            this.#subpaths = new (require('./subpaths'))(this, this.#subpackages);
        }
        catch (exc) {
            this.#error = {code: ERRORS.EXECUTION_ERROR, message: [exc.message]};
        }

        this.#promise.resolve();
        return await this.#promise.value;
    }
}
