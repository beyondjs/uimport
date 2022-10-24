module.exports = class {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    #version;
    get version() {
        return this.#version;
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    constructor(vspecifier) {
        const split = vspecifier.split('/');
        let pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
        let subpath = split.length ? split.join('/') : '';

        // Extract the version if specified
        let version = /(@[0-9.]*)?$/.exec(pkg)[0];
        version = version?.slice(1); // Extract the @ of the version
        pkg = version ? pkg.slice(0, pkg.length - version.length - 1) : pkg;

        this.#pkg = pkg;
        this.#specifier = pkg + (subpath ? `/${subpath}` : '');
        this.#subpath = subpath ? `./${subpath}` : void 0;
    }
}
