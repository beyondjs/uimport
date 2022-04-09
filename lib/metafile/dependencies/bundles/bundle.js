module.exports = class {
    // The package + subpath
    #id;
    get id() {
        return this.#id;
    }

    #im;
    get im() {
        return this.#im;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    constructor(im, pkg, subpath) {
        this.#im = im;
        this.#pkg = pkg;
        this.#subpath = subpath;

        this.#id = (() => {
            // subpath can be '.' or './subpath'
            subpath = subpath.slice(1); // Remove the '.' at the beginning
            return subpath ? `${pkg.name}${subpath}` : pkg.name;
        })();
    }
}
