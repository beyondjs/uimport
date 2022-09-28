module.exports = class extends Map {
    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #registry;

    #errors;
    /**
     * The list of errors generated while processing the dependencies tree
     * @return {Map<string, string>}
     */
    get errors() {
        return this.#errors;
    }

    #list;
    /**
     * The flat list of packages required by the dependency tree
     * @return {Map<string, {version}>}
     */
    get list() {
        return this.#list;
    }

    constructor(dependencies, registry) {
        super();
        this.#dependencies = dependencies;
        this.#registry = registry;
    }

    /**
     * Process the flat list of packages and errors after the dependencies tree was processed
     */
    #process() {
        const list = new Map();
        const errors = new Map();

        const recursive = dependencies => dependencies.forEach(({error, dependencies, version}, name) => {
            const vspecifier = `${name}@${version}`;
            if (error) {
                errors.set(vspecifier, {error});
                return;
            }

            list.set(vspecifier, version);
            dependencies && recursive(dependencies);
        });
        recursive(this);

        this.#list = list;
        this.#errors = errors;
    }

    async analyze() {
        this.clear();

        const recursive = async dependencies => {
            const output = new Map();

            for (const [name, version] of dependencies) {
                const pkg = this.#registry.obtain(name);

                const done = ({error, vdependency: vpackage, dependencies}) => {
                    dependencies = dependencies ? dependencies : new Map();
                    if (error) {
                        output.set(name, {error});
                        return;
                    }

                    const {version} = vpackage;
                    output.set(name, {vpackage, version, dependencies});
                }

                const {error} = await pkg.fetch();
                if (error) {
                    done({error: `Error fetching package "${name}": ${error}`});
                    continue;
                }

                const vdependency = pkg.version(version);
                if (!vdependency) {
                    done(({error: `Dependency version "${version}" is not valid`}));
                    continue;
                }

                if (!vdependency.dependencies) {
                    done({vdependency});
                    continue;
                }

                const dependencies = await (async () => {
                    if (!vdependency.dependencies) return;

                    const dependencies = new Map(Object.entries(vdependency.dependencies));
                    return await recursive(dependencies);
                })();
                done({vdependency, dependencies});
            }

            return output;
        }

        const dependencies = await recursive(this.#dependencies);
        dependencies.forEach((value, key) => this.set(key, value));
        this.#process();
    }
}
