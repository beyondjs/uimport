// Construct a map with the subpaths and their resources
module.exports = class extends Map {
    #pkg;
    #subpackages;
    get subpackages() {
        return this.#subpackages;
    }

    constructor(pkg, subpackages) {
        super();
        this.#pkg = pkg;
        this.#subpackages = subpackages;

        const exports = (() => {
            const {json} = pkg;
            const entries = (() => {
                if (!json.browser && !json.exports) return;
                return Object.entries(typeof json.browser === 'object' ? json.browser : json.exports);
            })();
            const exports = new Map(entries);

            if (!exports.has('.')) {
                let main = json.module ? json.module : json.main;
                if (main) {
                    main = !main.startsWith('./') ? `./${main}` : main;
                    exports.set('.', main);
                }
            }
            return exports;
        })();

        // To solve {exports: {import: '', require: ''}}
        exports.forEach((config, subpath) => {
            if (subpath.startsWith('.')) return;

            !exports.has('.') && exports.set('.', {});
            const conditionals = exports.get('.');
            conditionals[subpath] = config;
        });

        exports.forEach((config, subpath) => {
            if (!subpath.startsWith('.') || ['./package.json'].includes(subpath)) return;

            const file = (() => {
                if (typeof config === 'string') return config;

                config = config.browser ? config.browser : config;
                if (typeof config === 'string') return config;

                config = config.module ? config.module : config;
                if (typeof config === 'string') return config;

                config = config.main ? config.main : config;
                if (typeof config === 'string') return config;

                config = config.import ? config.import : config;
                if (typeof config === 'string') return config;

                return config.browser || config.module || config.main || config.default;
            })();

            if (typeof file !== 'string' || !file.startsWith('./')) return;

            this.set(subpath, file);
        });
    }

    find(path) {
        path = path.startsWith('./') ? path : `./${path}`;
        const found = [...this.#pkg.subpaths].find(([, file]) => file === path);
        if (found) return found;

        // Search in subpackages
        console.log('search in subpackages', path, this.#subpackages);
    }
}
