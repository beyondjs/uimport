const Bundle = require('./bundle');

module.exports = class extends Map {
    constructor(packaging, ims, packages) {
        super();

        ims.forEach(im => {
            const pkg = packages.get(im.location);

            // @TODO: Remove the commented line
            // im.file.endsWith('styles/zIndex.js') && console.log('here:'.red, pkg.name, im.file);

            const found = pkg.subpaths.find(im.file);
            if (!found) return;

            const subpath = found[0];
            const bundle = new Bundle(im, pkg, subpath);

            // @TODO: Remove the commented line
            // console.log(bundle.name, packaging)

            bundle.name !== packaging && this.set(im.input, bundle);
        });
    }
}
