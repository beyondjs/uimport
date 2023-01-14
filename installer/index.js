const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');
const packages = require('@beyond-js/uimport/packages-content');
const Internals = require('./internals');
const {Logger} = require('#store');

module.exports = class {
    #specs;

    #errors;
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors;
    }

    #logger;
    get logger() {
        return this.#logger;
    }

    async log(text, severity) {
        await this.#logger.add(text, severity);
    }

    constructor(specs) {
        specs = specs ? specs : {};

        if (typeof specs !== 'object') throw new Error('Invalid specification. An object is expected.');
        if (specs.internals && typeof specs.internals !== 'object') throw new Error('Invalid .internals specification');
        this.#specs = specs;

        this.#logger = (() => {
            const {pkg, version, application} = specs;
            let id = 'installer.' + application ? `application:${application}` : `package:${pkg}@${version}`;
            return new Logger(id);
        })();
    }

    async process() {
        const internals = new Internals(this.#specs.internals);
        const {pkg, version, application, json} = this.#specs
        const dependencies = new DependenciesTree({application, json, pkg, version, internals});
        await dependencies.process({update: true, logger: this.#logger});

        const {valid, errors} = dependencies;
        if (!valid) {
            this.#errors = errors;
            return;
        }

        this.#errors = [];

        !dependencies.list.size ? await this.log('No dependencies found') :
            await this.log(`${dependencies.list.size} dependencies found`);

        for (const {pkg, version} of dependencies.list.values()) {
            const internal = internals.get(pkg)?.versions.obtain(version);
            await this.log(`… ${pkg}@${version}` + (internal ? '[internal]' : ''));

            const dependencies = new DependenciesTree({pkg, version});
            await dependencies.process({update: true});
            const {valid} = dependencies;
            !valid && this.#errors.push(`Error processing package "${pkg}@${version}" dependencies tree`);

            const vpackage = packages.get(pkg, version);
            await vpackage.process({logger: this.#logger});
        }
    }
}
