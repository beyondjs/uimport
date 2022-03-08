// Construct a map with the subpaths and their resources
module.exports = class extends Map {
    constructor(pkg) {
        super();

        const {json} = pkg;
        if (!json.exports) {
            if (!json.module && !json.main) return;

            let file = json.file ? json.module : json.main;
            file = !file.startsWith('./') ? `./${file}` : file;
            this.set('.', file);
            return;
        }

        const exports = new Map(Object.entries(json.exports));

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
}
