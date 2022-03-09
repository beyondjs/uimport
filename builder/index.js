const fs = require('fs').promises;

module.exports = async function (bundle, application, paths) {
    await fs.mkdir(paths.input.dirname, {recursive: true});
    await fs.writeFile(
        paths.input.fullpath,
        `export * from '${bundle}';`, 'utf8'
    );

    const metafile = new (require('./metafile'))(bundle, application, paths);
    await metafile.process();
    if (!metafile.valid) return {errors: metafile.errors};

    const {code, errors, warnings} = await require('./build')(paths, metafile.externals);
    return {code, errors, warnings};
}
