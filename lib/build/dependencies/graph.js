const parser = require('../mformat/parser');

module.exports = class extends Map {
    #code;
    get code() {
        return this.#code;
    }

    constructor(metafile, specs) {
        super();

        const {dependencies: {bundles}} = metafile;
        const ids = [...bundles.values()].map(bundle => bundle.id);
        ids.forEach((bundle, index) => this.set(bundle, `dep_${index}`));

        this.#code = (() => {
            if (!this.size) return 'const require = () => void 0;';

            let code = '';
            // Create the map of dependencies
            const entries = [...this].map(([dependency, param]) =>
                `["${parser(dependency, specs)}", ${param}]`
            );
            code += `const dependencies = new Map([${entries}]);\n`;
            code += 'const require = dependency => dependencies.get(dependency);';
            return code;
        })();
    }
}