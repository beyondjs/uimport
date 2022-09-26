module.exports = class extends Map {
    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #repository;

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

    constructor(dependencies, repository) {
        super();
        this.#dependencies = dependencies;
        this.#repository = repository;
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
                const pkg = this.#repository.obtain(name);

                const done = ({error, version, dependencies}) => {
                    dependencies = dependencies ? dependencies : new Map();
                    error ? output.set(name, {error}) : output.set(name, {version, dependencies});
                }

                const {error} = await pkg.fetch();
                if (error) {
                    done({error: `Error fetching package "${name}": ${error}`});
                    continue;
                }

                const dependency = pkg.version(version);
                if (!dependency) {
                    done(({error: `Dependency version "${version}" is not valid`}));
                    continue;
                }

                if (!dependency.dependencies) {
                    done({version: dependency.version});
                    continue;
                }

                const dependencies = await (async () => {
                    if (!dependency.dependencies) return;

                    const dependencies = new Map(Object.entries(dependency.dependencies));
                    return await recursive(dependencies);
                })();
                done({version: dependency.version, dependencies});
            }

            return output;
        }

        const dependencies = await recursive(this.#dependencies);
        dependencies.forEach((value, key) => this.set(key, value));
        this.#process();
    }
}
