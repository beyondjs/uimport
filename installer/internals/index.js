const Package = require('./package');
const SpecifierParser = require('@beyond-js/specifier-parser');

module.exports = class extends Map {
    constructor(inputs) {
        super();

        inputs.forEach(({version, dependencies, devDependencies, peerDependencies}, vname) => {
            const specifier = new SpecifierParser(vname);

            const pkg = this.has(specifier.pkg) ? this.get(specifier.pkg) : new Package(specifier.pkg);
            pkg.versions.register(version, {dependencies, devDependencies, peerDependencies});
            this.set(specifier.pkg, pkg);
        });
    }
}
