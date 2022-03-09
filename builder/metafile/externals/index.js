module.exports = class extends Map {
    /**
     * Externals constructor
     *
     * @param metafile {object} The package metafile
     */
    constructor(metafile) {
        super();

        const errors = new Set();
        metafile.roots.forEach(root => {
            if (metafile.bundle === root.container) return; // Exclude the bundle being packaged
            root.external.error ? errors.add(root.container) : this.set(root.input, root);
        });

        // If a package has ims with errors, then the entire package is excluded as an external package
        // Happens when the "exports" property is not specified in the package.json,
        // in cases as "scheduler" (react-dom) or "lodash"
        errors.forEach(container => this.forEach(im => {
            return im.container === container && this.delete(im.input)
        }));
    }
}
