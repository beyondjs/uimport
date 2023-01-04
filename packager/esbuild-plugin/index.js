const packages = require('@beyond-js/uimport/packages-content');
const Resolver = require('./resolver');
const {sep} = require('path');

module.exports = class {
    // The plugin name
    get name() {
        return 'beyond-packager';
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    #externals = new Map();
    get externals() {
        return this.#externals;
    }

    async log(text, severity) {
        await this.#packager.log(text, severity);
    }

    constructor(packager) {
        this.#packager = packager;
    }

    async #resolve(args) {
        if (args.kind === 'entry-point') {
            return {namespace: 'beyond:entry-point', path: '.'};
        }

        await this.log(`Resolving "${args.path}"`);

        // The node of the graph being imported/required
        const resolver = new Resolver(this, args);
        await resolver.process();

        if (resolver.external) {
            const {namespace: {pkg}, kind} = resolver;
            const external = this.#externals.has(pkg) ? this.#externals.get(pkg) : new Set();
            external.add(kind);
            this.#externals.set(pkg, external);

            return kind === 'require-call' ?
                {namespace: `beyond_external:${resolver.namespace.pkg}`, path: '.'} :
                {external: true};
        }

        const {namespace, path} = resolver;
        return {namespace: namespace.value, path};
    }

    async #load(args) {
        if (args.namespace === 'beyond:entry-point') {
            const specifier = this.#packager.vspecifier.specifier;
            let contents = `export * from '${specifier}';`;

            contents += '\n\n' +
                `import _default from '${specifier}';\n` +
                `export default _default;`;
            return {contents};
        }

        const {path, namespace} = args;
        await this.log(`Loading "${path}" on "${namespace}"`);

        /**
         * External modules that are imported with a require function, not a esm import
         */
        if (namespace.startsWith('beyond_external:')) {
            const pkg = namespace.slice('beyond_external:'.length);
            const contents = `module.exports = __beyond_resolve_external('${pkg}');\n`;
            return {contents};
        }

        if (!namespace.startsWith('beyond:')) throw new Error('Namespace should start with "beyond:"');

        const vpkg = (() => {
            const vpkg = namespace.slice('beyond:'.length);
            const split = vpkg.split('/');
            const scope = split[0].startsWith('@') ? split.shift() : void 0;
            const {name, version} = (() => {
                const [name, version] = split.shift().split('@');
                return {name: scope ? `${scope}/${name}` : name, version};
            })();

            return packages.get(name, version);
        })();
        if (!vpkg.found) return;

        const file = (() => {
            const f = sep !== '/' ? path.replace(/\\/g, '/') : path;
            return vpkg.files.get(f.slice(2)); // Remove the './' at the beginning of the path
        })();
        if (!file) {
            await this.log(`File "${file}" on "${namespace}" not found`);
            return;
        }

        await file.process();
        const contents = file.content;
        return {contents};
    }

    setup = build => {
        build.onResolve({filter: /./}, args => this.#resolve(args));
        build.onLoad({filter: /./}, async args => await this.#load(args));
    }
}
