module.exports = class extends Map {
    #name

    #code;
    get code() {
        return this.#code;
    }

    get register() {
        const dependencies = JSON.stringify([...this.keys()]);
        return `typeof uimport === 'object' && uimport.bundles.register("${this.#name}", ${dependencies});\n\n`;
    }

    constructor(metafile) {
        super();

        const {bundles} = metafile.dependencies;
        const ids = [...bundles.values()].map(bundle => bundle.id);
        ids.forEach((bundle, index) => this.set(bundle, `dep_${index}`));

        this.#name = metafile.bundle;
        this.#code = (() => {
            if (!this.size) return 'const require = () => void 0;';

            let code = '';
            // Create the map of dependencies
            const entries = [...this].map(([dependency, param]) => `['${dependency.split('@')[0]}', ${param}]`);
            code += `const dependencies = new Map([${entries}]);\n`;
            code += 'const require = dependency => dependencies.get(dependency);';
            return code;
        })();
    }
}