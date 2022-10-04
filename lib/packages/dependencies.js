const packages = require('uimport/packages');

module.exports = class extends Map {
    constructor(dependencies, paths) {
        super();

        if (!dependencies.length) return;

        dependencies.forEach(dependency => {
            const key = `${paths.cwd}//${dependency}`;
            const pkg = packages.get(dependency, paths);
            this.set(key, pkg);
        });
    }

    async process() {
        const promises = [];
        this.forEach(pkg => promises.push(pkg.process()));
        await Promise.all(promises);
    }
}
