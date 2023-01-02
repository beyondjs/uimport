const {gt, satisfies} = require('semver');
const VPackage = require('./vpackage');

module.exports = class extends Map {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    constructor(pkg) {
        super();
        this.#pkg = pkg;
    }

    #order;
    get order() {
        return this.#order ? this.#order :
            (this.#order = [...this.keys()].sort((a, b) => gt(a, b)));
    }

    obtain(version) {
        const {order} = this;
        const resolved = order.find(v => satisfies(v, version));
        return resolved ? this.get(resolved) : void 0;
    }

    register(version, json) {
        this.set(version, new VPackage(this.#pkg, version, json));
    }
}
