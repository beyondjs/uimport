const esbuild = require('esbuild');

module.exports = async function (paths, externals) {
    let outputFiles, warnings;
    try {
        let errors;

        ({outputFiles, errors, warnings} = await esbuild.build({
            absWorkingDir: paths.inputs,
            entryPoints: [paths.input.relative],
            logLevel: 'silent',
            bundle: true,
            metafile: true,
            format: 'cjs',
            write: false,
            external: [...externals.keys()],
            treeShaking: false
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
