const p = require('path');
const fs = require('fs').promises;

module.exports = async function (bundle, paths) {
    if (!paths || typeof paths.cwd !== 'string' || typeof paths.temp !== 'string' || typeof paths.cache !== 'string') {
        throw new Error('Invalid parameters');
    }

    paths = Object.assign({}, paths);
    paths.cache = p.join(paths.cache, bundle);
    paths.temp = p.join(paths.cwd, paths.temp, bundle);

    const {id, subpath} = (() => {
        const split = bundle.split('/');
        const id = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
        return {id, subpath: split.join('/')};
    })();

    const {pkg} = (() => {
        return {pkg: require('uimport/packages').get(id, paths), subpath};
    })();
    if (pkg.error) return {errors: [`Package "${bundle}" not found`]};

    const file = `${pkg.version}.js`;
    paths.cache = p.join(paths.cache, file);
    paths.entryPoint = p.join(paths.temp, file);

    if (pkg.uimport) {
        if (pkg.json.static?.hasOwnProperty(`./${subpath}`)) {
            const code = await fs.readFile(p.join(pkg.path, pkg.json.static[`./${subpath}`]), 'utf8');
            return {code};
        }

        const {exports} = pkg.json;
        if (!Object.keys(exports).includes(`./${subpath}`)) return {errors: [`Bundle "${bundle}" not found`]};

        let entry = exports[`./${subpath}`].amd;
        entry = entry.replace('./', '');
        const path = p.join(pkg.path, entry);
        const code = await fs.readFile(path, 'utf8');

        let dependencies = [];
        pkg.json.dependencies && (dependencies = dependencies.concat(Object.keys(pkg.json.dependencies)));
        pkg.json.clientDependencies && (dependencies = dependencies.concat(pkg.json.clientDependencies));

        return !code ? {errors: [`Package "${bundle}" not found`]} : {code, dependencies};
    }

    const exists = await new Promise(r => fs.access(paths.cache)
        .then(() => r(true))
        .catch(() => r(false))
    );
    if (exists) {
        try {
            const build = await fs.readFile(paths.cache, 'utf8');
            const {errors, code, warnings, dependencies} = JSON.parse(build);

            return {errors, code, warnings, dependencies};
        }
        catch (exc) {
            console.error(`Error loading "${bundle}" from cache`);
        }
    }

    const build = async (def) => {
        await fs.mkdir(paths.temp, {recursive: true});
        let wrapper = `export * from '${bundle}';`;

        wrapper += !def ? '' : '\n\n' +
            `import _default from '${bundle}';\n` +
            `export default _default;`;

        await fs.writeFile(paths.entryPoint, wrapper, 'utf8');

        const metafile = new (require('./metafile'))(bundle, paths);
        await metafile.process();
        if (!metafile.valid) return {errors: metafile.errors};

        const dependencies = [...metafile.externals.values()].map(im => im.external.id);
        const build = await require('./build')(paths, metafile.externals);

        return Object.assign(build, {dependencies});
    }

    const {code, errors, warnings, dependencies} = await (async () => {
        const built = await build(true);
        if (!built.errors?.[0].includes('No matching export')) return built;

        // Try to build without the default export
        return await build();
    })();

    // Save into cache
    await fs.mkdir(p.dirname(paths.cache), {recursive: true});
    await fs.writeFile(paths.cache, JSON.stringify({code, errors, warnings, dependencies}), 'utf8');

    return {code, errors, warnings, dependencies};
}