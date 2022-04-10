const fs = require('fs').promises;
const SubPackage = require('./subpackage');

module.exports = class extends Map {
    #pkg;

    #warnings;
    get warnings() {
        return this.#warnings;
    }

    constructor(pkg) {
        super();
        this.#pkg = pkg;
    }

    #promise;

    async process() {
        if (this.#promise) return await this.#promise.value;
        this.#promise = Promise.pending();

        this.#warnings = [];
        const warnings = this.#warnings;

        const recursive = async (path, name) => {
            name = name.toLowerCase();

            const read = await fs.readdir(path, {encoding: 'utf8', withFileTypes: true});
            for (const entry of read) {
                if (entry.name === 'package.json' && entry.isFile()) {
                    if (name === '') continue; // Exclude the package.json of the bundle being analyzed

                    const subpackage = new SubPackage(path, name);
                    if (subpackage.error) {
                        warnings.push(subpackage.error);
                        continue;
                    }

                    subpackage.entry && this.set(name, subpackage);
                    continue;
                }
                if (!entry.isDirectory()) continue;

                const dir = require('path').join(path, entry.name);
                await recursive(dir, name ? `${name}/${entry.name}` : entry.name);
            }
        }

        await recursive(this.#pkg.path, '');

        this.#promise.resolve();
        return await this.#promise.value;
    }
}
