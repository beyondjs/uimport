const packages = require('uimport/packages');

module.exports = class extends Map {
    #errors;
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor(ims, paths) {
        super();
        const errors = [];
        this.#errors = errors;

        ims.forEach(im => {
            const cwd = require('path').join(paths.cwd, im.location);
            const pkg = packages.get(im.pkg, {cwd});
            if (pkg.error) {
                errors.push(pkg.error);
                return;
            }

            this.set(im.location, pkg);
        });
    }
}
