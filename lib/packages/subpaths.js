// Construct a map with the subpaths and their resources
module.exports = class extends Map {
    #pkg;
    #subpackages;
    get subpackages() {
        return this.#subpackages;
    }

    #css = new Map();
    get css() {
        return this.#css;
    }

    constructor(pkg, subpackages) {
        super();
        this.#pkg = pkg;
        this.#subpackages = subpackages;

        const {json} = pkg;
        const {browser} = typeof json.browser === 'object' ? json : {};
        const entry = value => browser?.hasOwnProperty(value) ? browser[value] : value;

        const exports = (() => {
            const entries = typeof json.exports === 'object' ? Object.entries(json.exports) : void 0;
            const exports = new Map(entries);

            if (!exports.has('.')) {
                let main = json.module ? json.module : json.main;
                if (main) {
                    main = !main.startsWith('./') ? `./${main}` : main;
                    exports.set('.', {default: main});
                }
            }
            return exports;
        })();

        if (typeof json.browser === 'string') {
            const browser = !json.browser.startsWith('./') ? `./${json.browser}` : json.browser;
            exports.set('.', {default: browser});
        }

        /**
         * To solve {exports: {import: '', require: ''}}
         * Ex: engine.io-parser@5.0.3
         */
        exports.forEach((config, conditional) => {
            if (conditional.startsWith('.') || typeof config !== 'string') return;

            !exports.has('.') && exports.set('.', {});
            const conditionals = exports.get('.');
            conditionals[conditional] = config;
        });

        const getConditionalExport = config => {
            if (typeof config === 'string') return entry(config);
            if (typeof config.browser === 'string') return entry(config.browser);

            config = typeof config.browser === 'object' ? config.browser : config;
            config = typeof config.import === 'object' ? config.import : config;

            const value = config.import || config.module || config.default;
            return entry(value);
        }

        exports.forEach((config, subpath) => {
            if (!subpath.startsWith('.') || ['./package.json'].includes(subpath)) return;

            let file = getConditionalExport(config);
            // validates if the browser, import, module or default conditional export is an object with another export conditional
            if (typeof file === 'object') file = getConditionalExport(file);
            if (typeof file !== 'string' || !file.startsWith('./')) return;

            this.set(subpath, file);
            config.css && typeof config.css === 'string' && this.#css.set(subpath, config.css);
        });
    }

    find(path) {
        path = path.startsWith('./') ? path : `./${path}`;
        const subpath = [...this].find(([, file]) => file === path);
        if (subpath) return subpath;

        // Search in subpackages
        return [...this.#subpackages].find(([, subpackage]) => subpackage.file === path);
    }
}