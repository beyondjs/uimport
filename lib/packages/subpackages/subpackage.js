module.exports = class {
    #error;
    get error() {
        return this.#error;
    }

    #name;
    get name() {
        return this.#name;
    }

    #file;
    get file() {
        return this.#file;
    }

    constructor(path, name) {
        this.#name = name;

        try {
            const json = require(`${path}/package.json`);

            /**
             * If a package specifies a map for the browser field in its package.json file,
             * esbuild will use that map to replace specific files or modules with their browser-friendly versions.
             * https://esbuild.github.io/api/#platform
             */
            this.#file = (() => {
                const {module, main} = json;
                const {browser} = typeof json.browser === 'object' ? json : {};

                const done = value => {
                    value = browser?.hasOwnProperty(value) ? browser[value] : value;
                    value = value.slice(2);
                    return name ? `./${name}/${value}` : `./${value}`;
                }

                if (typeof browser === 'string') return done(browser);
                return module || main ? done(module || main) : '';
            })();
        }
        catch (exc) {
            console.log(exc.stack);
            this.#error = `Subpackage "${path}" is invalid`;
        }
    }
}
