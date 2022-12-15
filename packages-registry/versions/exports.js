module.exports = class extends Map {
    constructor(values) {
        super();
        values && this.#set(values);
    }

    resolve(subpath, platform) {
        if (!subpath || !platform) throw new Error('Invalid parameters');
        if (!this.has(subpath)) return;

        const conditional = this.get(subpath);

        if (typeof conditional === 'string') return conditional;
        if (conditional.hasOwnProperty(platform)) return conditional[platform];
        if (conditional.hasOwnProperty('default')) return conditional.default;
    }

    #set(json) {
        const exports = typeof json.exports === 'object' ? new Map(Object.entries(json.exports)) : new Map();
        if (!exports.has('.')) {
            const conditional = {};
            const sanitize = path => !path.startsWith('./') ? `./${path}` : path;
            json.module && (conditional.module = conditional.browser = sanitize(json.module));
            json.main && (conditional.default = sanitize(json.main));
            exports.set('.', conditional);
        }

        this.clear();
        exports.forEach((value, key) => this.set(key, value));
    }

    hydrate(values) {
        this.clear();
        values.forEach(({key, value}) => this.set(key, value));
    }

    toJSON() {
        // Nested arrays are not supported in firestore
        return [...this].map(([key, value]) => ({key, value}));
    }
}
