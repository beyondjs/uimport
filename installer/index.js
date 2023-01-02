const {join} = require('path');
const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');
const packages = require('@beyond-js/uimport/packages-content');
const Internals = require('./internals');

module.exports = class {
    #specs;

    constructor(specs) {
        specs = specs ? specs : {};

        if (typeof specs !== 'object') throw new Error('Invalid specification. An object is expected.');
        if (specs.json && typeof specs.json !== 'object') throw new Error('Invalid .json specification');
        if (specs.internals && typeof specs.internals !== 'object') throw new Error('Invalid .internals specification');
        this.#specs = specs;
    }

    async process() {
        const json = (() => {
            if (this.#specs.json) return this.#specs.json;

            try {
                const path = join(process.cwd(), 'package.json');
                return require(path);
            }
            catch (exc) {
                console.log(`Error reading package.json file: "${exc.message}"`);
            }
        })();
        if (!json) return;

        const internals = new Internals(this.#specs.internals);
        const dependencies = new DependenciesTree({json, internals});
        await dependencies.process({load: true});

        !dependencies.list.size ? console.log('No dependencies found') :
            console.log(`${dependencies.list.size} dependencies found`);

        for (const {pkg, version} of dependencies.list.values()) {
            const internal = internals.get(pkg)?.versions.obtain(version);
            console.log(`… ${pkg}@${version} [${internal ? 'internal' : 'external'}]`);

            const dependencies = new DependenciesTree({pkg, version});
            await dependencies.process({load: true});

            const vpackage = packages.get(pkg, version);
            await vpackage.process();
        }
    }
}
