module.exports = class {
    #tree;
    get tree() {
        return this.#tree;
    }

    set tree(value) {
        this.#tree = value;
        this.#postprocess(value);
    }

    #errors = [];
    /**
     * The list of errors generated while processing the dependencies tree
     * @return {Map<string, string>}
     */
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors?.length;
    }

    #list;
    /**
     * The flat list of packages required by the dependency tree
     * The key of the map is the vpkg
     * @return {Map<string, {vpkg, pkg, version, dependencies}>}
     */
    get list() {
        return this.#list;
    }

    /**
     * Process the flat list of packages and errors after the dependencies tree was processed
     */
    #postprocess(tree) {
        const list = new Map();
        const errors = [];

        const recursive = dependencies => dependencies.forEach(({error, dependencies, version, vpackage}, pkg) => {
            const vpkg = `${pkg}@${version}`;
            if (error) {
                errors.push(`Error on package "${vpkg}": ${error}`);
                return;
            }

            !list.has(vpkg) && list.set(vpkg, {vpkg, pkg, version, dependencies});
            dependencies && recursive(dependencies);
        });
        recursive(tree);

        this.#list = list;
        this.#errors = errors;
    }

    hydrate(stored) {
        const recursive = branch => {
            const hydrated = new Map();
            branch.forEach(({pkg, value}) => hydrated.set(pkg, value));

            hydrated.forEach(({version, dependencies}, pkg) => {
                const value = {version};
                dependencies && (value.dependencies = recursive(dependencies));
                return hydrated.set(pkg, value);
            });

            return hydrated;
        };

        const {dependencies} = stored;
        const tree = this.#tree = recursive(dependencies);

        this.#postprocess(tree);
    }

    toJSON() {
        if (!this.#tree) return;

        const recursive = branch => [...branch].map(([pkg, {version, dependencies}]) => {
            const value = {version};
            dependencies && (value.dependencies = recursive(dependencies));
            return {pkg, value};
        });

        const dependencies = recursive(this.#tree);
        return {dependencies};
    }
}
