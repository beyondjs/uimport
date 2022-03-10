const fs = require('fs').promises;
const p = require('path');

module.exports = async function (bundle, paths) {
    if (!paths || typeof paths.cwd !== 'string' || typeof paths.temp !== 'string' || typeof paths.cache !== 'string') {
        throw new Error('Invalid parameters');
    }

    paths = Object.assign({}, paths);
    paths.cache = p.join(paths.cache, bundle);
    paths.temp = p.join(paths.cwd, paths.temp, bundle);

    const {pkg} = (() => {
        const {id, subpath} = (() => {
            const split = bundle.split('/');
            const id = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
            return {id, subpath: split.join('/')};
        })();

        return {pkg: require('uimport/packages').get(id, paths), subpath};
    })();
    if (pkg.error) return {errors: [`Package "${bundle}" not found`]};

    const file = `${pkg.version}.js`;
    paths.cache = p.join(paths.cache, file);
    paths.entryPoint = p.join(paths.temp, file);

    const exists = await new Promise(r => fs.access(paths.cache)
        .then(() => r(true))
        .catch(() => r(false))
    );
    if (exists) {
        try {
            const build = await fs.readFile(paths.cache, 'utf8');
            const {errors, code, warnings} = JSON.parse(build);
            return {errors, code, warnings};
        }
        catch (exc) {
            console.log(`Error loading "${bundle}" from cache`);
        }
    }

    await fs.mkdir(paths.temp, {recursive: true});
    await fs.writeFile(
        paths.entryPoint,
        `export * from '${bundle}';`, 'utf8'
    );

    const metafile = new (require('./metafile'))(bundle, paths);
    await metafile.process();
    if (!metafile.valid) return {errors: metafile.errors};

    const {code, errors, warnings} = await require('./build')(paths, metafile.externals);

    // Save into cache
    await fs.mkdir(p.dirname(paths.cache), {recursive: true});
    await fs.writeFile(paths.cache, JSON.stringify({code, errors, warnings}), 'utf8');

    return {code, errors, warnings};
}
