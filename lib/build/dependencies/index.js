module.exports = class extends Map {
    #graph;
    get graph() {
        return this.#graph;
    }

    constructor(metafile, specs) {
        super();

        this.#graph = new (require('./graph'))(metafile, specs);
        const ids = [...metafile.packages.values()].map(pkg =>
            specs.versions ? `${pkg.name}@${pkg.version}` : pkg.name
        );
        ids.forEach((pkg, index) => this.set(pkg, `dep_${index}`));
    }
}