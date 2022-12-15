const crc32 = require('@beyond-js/crc32');
const equal = require('@beyond-js/equal');

module.exports = class extends Map {
    #hash;
    get hash() {
        return this.#hash;
    }

    constructor(json) {
        super();
        json && this.#set(json);
    }

    #set(json) {
        const process = (dependency, version, kind) => this.set(dependency, {version, kind});
        const {dependencies: main, devDependencies: development, peerDependencies: peer} = json;

        main && Object.entries(main).forEach(entry => process(...entry, 'main'));
        development && Object.entries(development).forEach(entry => process(...entry, 'development'));
        peer && Object.entries(peer).forEach(entry => process(...entry, 'peer'));

        const compute = {};
        this.forEach(({version, kind}, specifier) => compute[specifier] = {version, kind});
        this.#hash = crc32(equal.generate(compute));
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
