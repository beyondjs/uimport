module.exports = class {
    // The bundle name + version
    #id;
    get id() {
        return this.#id;
    }

    // The package name + subpath
    #name;
    get name() {
        return this.#name;
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

        subpath = subpath.startsWith('./') ? subpath.slice(2) : subpath;
        this.#name = subpath !== '.' ? `${pkg.name}/${subpath}` : pkg.name;
        this.#id = `${this.#name}@${pkg.version}`;
    }
}
