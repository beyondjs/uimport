const resolve = (require('resolve-package-path'));

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

    #dependencies;
    get dependencies() {
        return this.#dependencies;
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
                this.#error = `Package "${this.#name}" not found`;
                this.#promise.resolve();
                return;
            }

            // Read the package.json
            this.#json = require(resolved);

            const deps = this.#json.dependencies ? Object.keys(this.#json.dependencies) : [];
            this.#dependencies = new (require('./dependencies'))(deps, this.#paths);

            // The path comes with the '/package.json' in it
            this.#path = require('path').resolve(resolved, '..');

            this.#subpackages = new (require('./subpackages'))(this);
            await this.#subpackages.process();

            this.#subpaths = new (require('./subpaths'))(this, this.#subpackages);
            this.#promise.resolve();
        }
        catch (exc) {
            console.log(exc.stack);
            this.#error = exc.message;
            this.#promise.reject(exc);
        }

        return await this.#promise.value;
    }
}
