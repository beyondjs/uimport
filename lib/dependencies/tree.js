export default class {
    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #packages;

    constructor(dependencies, packages) {
        this.#dependencies = dependencies;
        this.#packages = packages;
    }

    async analyze() {
        const recursive = async dependencies => {
            for (const [name, version] of dependencies) {
                const pkg = this.#packages.obtain(name);

                const {error} = await pkg.fetch();
                if (error) {
                    console.log(`Error fetching package "${name}": ${error}`);
                    return;
                }

                const dependencies = (() => {
                    const satisfies = pkg.version(version);
                    if (!satisfies.dependencies) return;

                    return new Map(Object.entries(satisfies.dependencies));
                })();
                console.log('Package version', dependencies);
                dependencies && await recursive(dependencies);
            }
        }

        await recursive(this.#dependencies);
    }
}
