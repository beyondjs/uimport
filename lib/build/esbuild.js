const esbuild = require('esbuild');

/**
 * Package the bundle thanks to esbuild
 *
 * @param wrapper {string} The wrapper file
 * @param cwd {string} The working directory
 * @param metafile {object} The metafile
 * @return {Promise<{packaged?: string, errors?: string[], warnings?: string[]}>}
 */
module.exports = async function (wrapper, cwd, metafile) {
    let outputFiles, warnings;
    try {
        let errors;
        const {bundles} = metafile.dependencies;
        const excluded = [...bundles.keys()].map(external => `./${external}`);

        ({outputFiles, errors, warnings} = await esbuild.build({
            absWorkingDir: cwd,
            entryPoints: [wrapper],
            logLevel: 'silent',
            bundle: true,
            metafile: true,
            platform: 'browser',
            format: 'cjs',
            write: false,
            treeShaking: false,
            external: excluded
        }));

        warnings = warnings.map(message => message.text);

        if (errors.length) {
            errors = errors.map(message => message.text);
            return {errors, warnings};
        }
    }
    catch (exc) {
        return {errors: [exc.message]};
    }

    const packaged = outputFiles[0].text;
    return {packaged, warnings};
}
