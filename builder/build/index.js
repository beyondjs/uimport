const esbuild = require('esbuild');

module.exports = async function (paths, externals) {
    let outputFiles, warnings;
    try {
        let errors;
        const exclude = [...externals.values()].map(external => `${external.im.root}/${external.id}/*`);

        ({outputFiles, errors, warnings} = await esbuild.build({
            absWorkingDir: paths.inputs,
            entryPoints: [paths.input.relative],
            logLevel: 'silent',
            bundle: true,
            metafile: true,
            format: 'cjs',
            write: false,
            external: exclude,
            treeShaking: false
        }));
        if (errors.length) return {errors, warnings};
    }
    catch (exc) {
        return {errors: [exc.message]};
    }

    const packaged = outputFiles[0].text;

    // Transform the dependencies
    // Ex: node_modules/svelte/internal/internal.js => svelte/internal
    // let code;
    // ({code, errors} = require('./dependencies/transform')(packaged, dependencies, application));
    // if (errors?.length) return {errors};

    // Expose as an AMD module
    const code = require('./amd')(packaged, externals);
    return {code, warnings};
}
