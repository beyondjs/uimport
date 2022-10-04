/**
 * Build the bundle
 *
 * @param bundle {string} The bundle (package/subpath)
 * @param version {string} The package version
 * @param mode {string} Can be 'esm', 'sjs', 'amd'
 * @param UISpecs {{cwd: string, temp: string, versions:boolean}}
 * @return {Promise<{code?: string, warnings?: string[], errors?: string[], dependencies?: {path: string, id: string}[]}>}
 */
module.exports = async function (bundle, version, mode, UISpecs) {
    if (!['esm', 'sjs', 'amd'].includes(mode)) throw new Error('Invalid parameters');

    let errors, code, warnings, packaged, metafile;
    ({errors, warnings, packaged, metafile} = await (async () => {
        const process = async (specs) => {
            const wrapper = await require('./wrapper')(bundle, version, specs);
            const metafile = new (require('./metafile'))(bundle, version, wrapper, UISpecs.cwd);
            await metafile.process();
            if (metafile.errors?.length) return {errors: metafile.errors};

            const {packaged, errors, warnings} = await require('./esbuild')(wrapper, UISpecs.cwd, metafile);

            // Just to log to console in development environment
            !errors?.length && require('./logs')(metafile);

            return {packaged, errors, warnings, metafile};
        }

        let packaged, errors, warnings;

        // Try bundling with default export
        ({packaged, errors, warnings, metafile} = await process({default: true, path: UISpecs.temp}));
        if (!errors) return {packaged, warnings, metafile};

        // Try without default export
        ({packaged, errors, warnings, metafile} = await process({default: false, path: UISpecs.temp}));
        return {packaged, errors, warnings, metafile};
    })());
    if (errors) return {errors, warnings};

    let {exports, reexports} = require('cjs-module-lexer').parse(packaged);
    exports = exports.length ? exports : metafile.exports;

    // Transform the externals
    // Ex: node_modules/svelte/internal/internal.js => svelte/internal
    ({code, errors} = require('./externals')(packaged, metafile, UISpecs.versions));
    if (errors?.length) return {errors};

    // Expose as an AMD module
    code = (() => {
        const dependencies = new (require('./dependencies'))(metafile, UISpecs);
        const script = require('./module')(code);
        return require('./mformat')(mode, {code: script, metafile}, dependencies, exports, reexports, UISpecs);
    })();

    const dependencies = [...metafile.dependencies.bundles.values()].map(bundle => ({
        id: bundle.id,
        path: bundle.pkg.path
    }));

    return {code, warnings, dependencies};
}
