/**
 * Build the bundle
 *
 * @param bundle {string} The bundle (package/subpath)
 * @param version {string} The package version
 * @param mode {string} Can be 'esm', 'amd'
 * @param paths {{cwd: string, temp: string}}
 * @return {Promise<{code?: string, warnings?: string[], errors?: string[]}>}
 */
module.exports = async function (bundle, version, mode, paths) {
    if (!['amd', 'esm'].includes(mode)) throw new Error('Invalid parameters');

    const metafile = new (require('./metafile'))(bundle, paths.cwd);
    await metafile.process();
    if (!metafile.valid) return {errors: metafile.errors};

    // Just to log to console in development environment
    require('./logs')(metafile);

    let errors, code, warnings, packaged;
    ({errors, warnings, packaged} = await (async () => {
        let wrapper, packaged, errors, warnings;

        // Try bundling with default export
        wrapper = await require('./wrapper')(bundle, version, {default: true, path: paths.temp});
        ({packaged, errors, warnings} = await require('./esbuild')(wrapper, paths.cwd, metafile));
        if (!errors) return {packaged, warnings};

        // Try without default export
        wrapper = await require('./wrapper')(bundle, version, {default: false, path: paths.temp});
        return await require('./esbuild')(wrapper, paths.cwd, metafile);
    })());
    if (errors) return {errors, warnings};

    let {exports, reexports} = require('cjs-module-lexer').parse(packaged);
    exports = exports.length ? exports : metafile.exports;

    // Transform the externals
    // Ex: node_modules/svelte/internal/internal.js => svelte/internal
    ({code, errors} = require('./externals')(packaged, metafile));
    if (errors?.length) return {errors};

    // Expose as an AMD module
    (code = require(`./${mode}`)(code, metafile, exports, reexports));

    const dependencies = [...metafile.dependencies.bundles.values()].map(bundle => ({
        id: bundle.id,
        path: bundle.pkg.path
    }));

    return {code, warnings, dependencies};
}
