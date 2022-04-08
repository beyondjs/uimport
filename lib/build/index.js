const esbuild = require('esbuild');

module.exports = async function (paths, externals) {
    let outputFiles, warnings;
    try {
        let errors;
        const excluded = [...externals.keys()].map(external => `./${external}`);

        ({outputFiles, errors, warnings} = await esbuild.build({
            absWorkingDir: paths.cwd,
            entryPoints: [paths.entryPoint],
            logLevel: 'silent',
            bundle: true,
            metafile: true,
            platform: 'browser',
            format: 'cjs',
            write: false,
            treeShaking: false,
            external: excluded
        }));
        if (errors.length) return {errors, warnings};
    }
    catch (exc) {
        return {errors: [exc.message]};
    }

    const packaged = outputFiles[0].text;

    // Transform the externals
    // Ex: node_modules/svelte/internal/internal.js => svelte/internal
    let code, errors;
    ({code, errors} = require('./externals')(packaged, externals));
    if (errors?.length) return {errors};

    // Expose as an AMD module
    (code = require('./amd')(code, externals));
    return {code, warnings};
}
