const resolve = (require('resolve-package-path'));
const ERRORS = (require('./ERRORS'));

module.exports = class {
    #error;
    get error() {
        return this.#error;
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

    constructor(im, application) {
        try {
            const resolved = resolve(im.pkg, application.path);
            if (!resolved) {
                this.#error = {code: ERRORS.PACKAGE_NOT_FOUND, message: `Package "${im.pkg}" not found`};
                return;
            }

            // Read the package.json
            this.#json = require(resolved);

            // The path comes with the '/package.json' in it
            this.#path = require('path').resolve(resolved, '..');

            this.#subpaths = new (require('./subpaths'))(this);
        }
        catch (exc) {
            return this.#error = {code: ERRORS.EXECUTION_ERROR, message: [exc.message]};
        }
    }
}
