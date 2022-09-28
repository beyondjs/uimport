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
        const vpackage = pkg.version(this.#version);

        const downloader = new Downloader(vpackage, this.#specs.downloader);
        await downloader.process();

        await require('./process')(this.#pkg, downloader.target.dir, tree);
    }
}
