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

    #path;
    get path() {
        return this.#path;
    }

    #subpaths;
    get subpaths() {
        return this.#subpaths;
    }

    #json;
    get json() {
        return this.#json;
    }

    get uimport() {
        return this.#json.uimport;
    }

    get version() {
        return this.#json.version;
    }

    constructor(name, paths) {
        this.#name = name;

        try {
            const resolved = resolve(name, paths.cwd);
            if (!resolved) {
                this.#error = {code: ERRORS.PACKAGE_NOT_FOUND, message: `Package "${name}" not found`};
                return;
            }

            // Read the package.json
            this.#json = require(resolved);

            // The path comes with the '/package.json' in it
            this.#path = require('path').resolve(resolved, '..');

            this.#subpaths = new (require('./subpaths'))(this);
        }
        catch (exc) {
            this.#error = {code: ERRORS.EXECUTION_ERROR, message: [exc.message]};
        }
    }
}
