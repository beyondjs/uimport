const SpecifierParser = require('@beyond-js/specifier-parser');

module.exports = class {
    #error;
    get error() {
        return this.#error;
    }

    #vdir;
    get vdir() {
        return this.#vdir;
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #application;
    get application() {
        return this.#application;
    }

    #pathname;
    get pathname() {
        return this.#pathname;
    }

    #action;
    get action() {
        return this.#action;
    }

    #options;
    get options() {
        return this.#options;
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

        const done = ({specifier, application, error}) => {
            if (error) {
                this.#error = error;
                return;
            }

            const {query} = req;
            this.#options = {
                platform: query.platform ? query.platform : 'browser',
                format: query.format ? query.format : 'esm',
                minify: query.min !== void 0,
                types: query.types !== void 0,
                css: query.css !== void 0,
                map: query.map !== void 0,
                logs: query.logs !== void 0
            };
            this.#body = req.body;

            this.#pathname = pathname;
            this.#vdir = vdir;
            this.#application = application;
            this.#specifier = specifier;
        }

        if (vdir === 'app.dependencies') {
            const split = pathname.split('/');
            if (!split.length) return done({error: `Platform or action must be specified`});
            if (!['register', 'get'].includes(split[0])) {
                const error = `Action "${split[0]}" is invalid`;
                return done({error});
            }

            this.#action = split.shift();

            if (split.length > 2) {
                const error = 'Error: (404) - Invalid URL, just specify customer id and application id';
                return done({error});
            }
            if (split.length !== 2) {
                const error = 'Error: (404) - Invalid URL, customer and application name must be specified';
                return done({error});
            }

            const application = (() => {
                const customer = split.shift();
                const application = split.shift();
                return `${customer}/${application}`;
            })();
            return done({application});
        }

        const vdirs = ['dependencies', 'modules', 'files', 'info'];
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
