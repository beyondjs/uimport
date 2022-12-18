const SpecifierParser = require('@beyond-js/specifier-parser');

module.exports = class {
    #error;
    get error() {
        return this.#error;
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #vdir;
    get vdir() {
        return this.#vdir;
    }

    #pathname;
    get pathname() {
        return this.#pathname;
    }

    #query;
    get query() {
        return this.#query;
    }

    #body;
    get body() {
        return this.#body;
    }

    constructor(req) {
        const {pathname, vdir} = (() => {
            let pathname = req.path.slice(1);
            if (!pathname) return {pathname};

            const split = pathname.split('/');
            const vdir = split.shift();
            pathname = split.join('/');
            return {vdir, pathname};
        })();

        const done = ({specifier, error}) => {
            if (error) {
                this.#error = error;
                return;
            }
            this.#query = req.query;
            this.#body = req.body;

            this.#pathname = pathname;
            this.#vdir = vdir;
            this.#specifier = specifier;
        }

        if (vdir === 'dependencies') return done({});

        const vdirs = ['info', 'modules', 'files'];
        if (!vdirs.includes(vdir)) return done({error: 'Resource not found'});
        if (!pathname) return done({error: 'Package name and version must be set'});

        const specifier = new SpecifierParser(pathname);
        if (!specifier.valid) {
            const {value, error} = specifier;
            return done({error: `Module specifier "${value}" is invalid: "${error}"`});
        }
        if (!specifier.pkg) {
            return done({error: 'Package name must be set'});
        }
        return done({specifier});
    }
}
