const packages = require('../packages');
const ERRORS = require('./errors');

module.exports = class {
    #im;
    get im() {
        return this.#im;
    }

    #error;
    get error() {
        return this.#error;
    }

    get ERRORS() {
        return ERRORS;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #id;
    get id() {
        return this.#id;
    }

    constructor(im, paths) {
        this.#im = im;

        const pkg = packages.get(im.pkg, paths);
        if (pkg.error) {
            this.#error = {code: ERRORS.PACKAGE_NOT_FOUND, error: pkg.error};
            return;
        }
        this.#pkg = pkg;

        let found = [...pkg.subpaths].find(([, file]) => file === `./${im.file}`);
        const subpath = found?.[0];

        if (!subpath) {
            this.#error = {code: ERRORS.SUBPATH_NOT_FOUND, message: `External does not exports subpath "./${im.file}"`};
            return;
        }

        this.#id = `${im.pkg}${subpath.slice(1)}`;
    }
}
