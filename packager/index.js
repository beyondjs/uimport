const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');
const packages = require('@beyond-js/uimport/packages-content');
const registry = require('@beyond-js/uimport/packages-registry');
const Plugin = require('./esbuild-plugin');
const SourceMap = require('./sourcemap');
const {sep} = require('path');
const resolveRequireCalls = require('./require-calls');
const SpecifierParser = require('@beyond-js/specifier-parser');
const {Logger} = require('#store');

module.exports = class {
    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #uimport;
    get uimport() {
        return this.#uimport;
    }

    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    #found;
    get found() {
        return this.#found;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors?.length;
    }

    #logger;
    get logger() {
        return this.#logger;
    }

    async log(text, severity) {
        await this.#logger.add(text, severity);
    }

    /**
     * Packager constructor
     * @param vspecifier
     * @param platform {string}
     */
    constructor(vspecifier, platform) {
        if (!(vspecifier instanceof SpecifierParser) || !platform) throw new Error('Invalid parameters');
        if (!vspecifier.valid) throw new Error(`Specifier "${vspecifier.value}" is invalid: ${vspecifier}`);

        this.#vspecifier = vspecifier;
        this.#platform = platform;

        const {pkg, version} = vspecifier;
        this.#logger = (() => {
            const split = pkg.split('/');
            const scope = split[0].startsWith('@') ? split.shift() : void 0;
            const name = scope ? `${scope}!${split.shift()}` : split.shift();
            return new Logger('modules.create', `${name}-${version}`);
        })();
    }

    /**
     * Check if package and its version are found and valid
     */
    async #prepare() {
        await this.log(`Checking that the specifier "${this.#vspecifier.value}" exists`);

        const pkg = registry.get(this.#vspecifier.pkg);
        const vpkg = await pkg.versions.get(this.#vspecifier.version);

        if (!pkg.found) {
            this.#found = false;
            const message = `Package "${this.#vspecifier.pkg}" not found`;
            this.#errors = [message];
            await this.log(message);
            return;
        }
        if (!pkg.valid) {
            const message = pkg.error;
            this.#errors = [message];
            await this.log(message);
            return;
        }
        if (!vpkg) {
            this.#found = false;
            const message = `Version "${this.#vspecifier.version}" of package "${this.#vspecifier.pkg}" not found`;
            this.#errors = [message];
            await this.log(message);
            return;
        }
        if (!vpkg.valid) {
            const message = vpkg.error;
            this.#errors = [message];
            await this.log(message);
            return;
        }

        const {subpath} = this.#vspecifier;
        if (!vpkg.exports.has(subpath)) {
            this.#found = false;
            const exports = JSON.stringify([...vpkg.exports.keys()]);
            const message = `Subpath "${subpath}" not found.\nExported subpaths: ${exports}`
            this.#errors = [message];
            await this.log(message);
            return;
        }

        this.#found = true;

        const resolved = vpkg.exports.resolve(subpath, this.#platform);
        if (!resolved) {
            this.#found = false;
            const message = `Platform "${this.platform}" cannot be resolved for subpath "${subpath}"`;
            this.#errors = [message];
            this.log(message);
            return;
        }

        vpkg.uimport && (this.#uimport = resolved.slice(2));
    }

    async process() {
        await this.#prepare();
        if (!this.valid) return;

        const {pkg, version} = this.#vspecifier;

        if (this.#uimport) {
            const pcontent = packages.get(pkg, version);
            await pcontent.process();

            if (!pcontent.files.has(this.#uimport)) {
                const message = `File "${this.#uimport}" not found`;
                this.#errors = [message];
                this.log(message);
                return;
            }

            const file = pcontent.files.get(this.#uimport);
            await file.process();

            this.#code = file.content;
            return;
        }

        /**
         * Process the dependencies tree
         */
        await this.log('Processing the dependencies tree');
        const dependencies = new DependenciesTree({pkg, version});
        await dependencies.process({load: true});
        if (!dependencies.valid) {
            this.#errors = dependencies.errors;
            return;
        }
        this.#dependencies = dependencies.list;

        /**
         * Check that all dependencies are installed
         */
        await this.log('Check that all dependencies are installed');
        const promises = [];
        for (const {pkg, version} of dependencies.list.values()) {
            const pcontent = packages.get(pkg, version);
            promises.push(pcontent.process());
        }
        await Promise.all(promises);

        const plugin = new Plugin(this);

        const result = await require('esbuild').build({
            entryPoints: ['bundle.js'],
            incremental: false,
            sourcemap: 'external',
            logLevel: 'silent',
            platform: 'browser',
            format: 'esm',
            bundle: true,
            write: false,
            outfile: 'out.js',
            plugins: [plugin]
        });
        await this.log('Bundle has been built');

        const {errors, warnings, outputFiles: outputs} = result;
        this.#errors = errors ? errors : [];
        this.#warnings = warnings ? warnings : [];

        const {code, map} = (() => {
            const output = {};
            output.code = outputs?.find(({path}) => path.endsWith(`${sep}out.js`))?.text;
            output.map = outputs?.find(({path}) => path.endsWith(`${sep}out.js.map`))?.text;

            const requires = resolveRequireCalls(plugin);
            if (!requires) return output;

            const sourcemap = new SourceMap();
            sourcemap.concat(requires.imports);
            sourcemap.concat(requires.resolver);
            sourcemap.concat(output.code, void 0, output.map);
            return sourcemap;
        })();

        this.#code = code;
        this.#map = map;
    }
}
