const fs = require('fs').promises;

module.exports = async function (bundle, application, paths) {
    await fs.mkdir(paths.input.dirname, {recursive: true});
    await fs.writeFile(
        paths.input.fullpath,
        `export * from '${bundle}';`, 'utf8'
    );

    const metafile = new (require('./metafile'))(paths);
    await metafile.process();

    const externals = new (require('./externals'))(bundle, metafile.roots, application);

    const {code, errors, warnings} = await require('./build')(paths, externals);
    return {code, errors, warnings};
}
