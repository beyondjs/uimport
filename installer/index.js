const {join} = require('path');
const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');
const packages = require('@beyond-js/uimport/packages-content');

module.exports = class {
    #cwd;

    constructor(cwd) {
        this.#cwd = cwd ? cwd : process.cwd();
    }

    async process() {
        let json;
        try {
            const path = join(this.#cwd, 'package.json');
            json = require(path);
        }
        catch (exc) {
            console.log(`Error reading package.json file: "${exc.message}"`);
            return;
        }

        const dependencies = new DependenciesTree({json});
        await dependencies.process({load: true});

        for (const {pkg, version} of dependencies.list.values()) {
            console.log(`… ${pkg}@${version}`);

            const dependencies = new DependenciesTree({pkg, version});
            await dependencies.process({load: true});

            const vpackage = packages.get(pkg, version);
            await vpackage.process();
        }
    }
}
