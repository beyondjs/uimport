const External = require('./external');

module.exports = class extends Map {
    constructor(bundle, ims, application) {
        super();

        const errors = new Set();
        ims.forEach(im => {
            if (bundle === im.pkg) return; // Exclude the bundle being packaged

            const external = new External(im, application);
            external.error ? errors.add(im.pkg) : this.set(im.input, external);
        });

        // If a package has ims with errors, then the entire package is excluded as an external package
        // Happens when the "exports" property is not specified in the package.json,
        // in cases as "scheduler" (react-dom) or "lodash"
        errors.forEach(pkg => this.forEach(({im}) => im.pkg === pkg && this.delete(im.input)));
    }
}
