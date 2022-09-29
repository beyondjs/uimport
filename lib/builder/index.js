const Registry = require('uimport/registry');
const Dependencies = require('uimport/dependencies');
const Downloader = require('uimport/downloader');

module.exports = class {
    #pkg;
    #version;
    #specs;

    constructor(pkg, version, specs) {
        if (!specs?.registry.cache || !specs.downloader.cache) throw new Error('Invalid parameters');

        this.#pkg = pkg;
        this.#version = version;
        this.#specs = specs;
    }

    async process() {
        const registry = new Registry(this.#specs.registry);
        const tree = new Dependencies(new Map([[this.#pkg, this.#version]]), registry);

        // Generate the dependencies tree of the package to be built
        await tree.analyze();

        // Get the vpackage required to process the building
        const pkg = registry.obtain(this.#pkg);
        await pkg.fetch();

        const {downloads, errors} = await (async () => {
            const downloads = new Map();
            const errors = [];

            for (const [vname, vpackage] of tree.list) {
                const downloader = new Downloader(vpackage, this.#specs.downloader);
                try {
                    await downloader.process();
                }
                catch (exc) {
                    errors.push(`Error downloading package "${vname}": ${exc.message}`);
                    continue;
                }

                downloads.set(vname, downloader);
            }
            return {downloads, errors};
        })();

        if (errors?.length) return {errors};
        return await require('./process')(this.#pkg, this.#version, tree, downloads);
    }
}
