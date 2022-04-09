const Bundle = require('./bundle');

module.exports = class extends Map {
    constructor(ims, packages) {
        super();

        ims.forEach(im => {
            const pkg = packages.get(im.location);

            const found = [...pkg.subpaths].find(([, file]) => file === `./${im.file}`);
            if (!found) return;

            const subpath = found[0];
            const bundle = new Bundle(im, pkg, subpath);
            found && this.set(im.input, bundle);
        });
    }
}
