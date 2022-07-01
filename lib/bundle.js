require('./utils');
const fs = require('fs').promises;
const {join, dirname} = require('path');

// Save in memory cache the already accessed packages
const mcached = new Map();

/**
 * Generate the esm bundled version of a package/subpath
 *
 * @param bundle {string} The package name + subpath
 * @param mode {string} Can be 'esm' or 'amd'
 * @param paths {{cwd: string, cache: string, temp: string}}
 * @return {Promise<{errors: [string]}|any>}
 */
module.exports = async function (bundle, mode, paths) {
    if (!paths || typeof paths.cwd !== 'string' || typeof paths.temp !== 'string' || typeof paths.cache !== 'string') {
        return {errors: ['Invalid parameters']};
    }
    mode = mode ? mode : 'esm';
    if (!['amd', 'esm'].includes(mode)) throw new Error('Invalid mode parameter');

    let pkg, subpath, version;
    ({bundle, pkg, subpath, version} = await (async () => {
        let version = /(@[0-9.]*)?$/.exec(bundle)[0];
        bundle = bundle.slice(0, bundle.length - version.length);
        version = version.slice(1); // Extract the @ of the version

        const {id, subpath} = (() => {
            const split = bundle.split('/');
            const id = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
            const subpath = split.length ? `./${split.join('/')}` : void 0;
            return {id, subpath};
        })();

        const pkg = require('uimport/packages').get(id, paths);
        await pkg.process();

        version = !version && !pkg.error ? pkg.version : version;

        return {bundle, pkg, subpath, version};
    })());

    // Check if package is in memory cache
    // The bundle could have been generated in a version that cannot be accessed directly, because it was still
    // generated as a dependency of another package (dependencies of packages with different versions)
    const key = `${bundle}/${version}/+${mode}`;
    if (mcached.has(key)) return mcached.get(key);

    if (pkg.error) return {errors: [`Package "${pkg.name}" not found`]};

    if (subpath && !pkg.subpaths.has(subpath) && !pkg.subpackages.has(subpath)) {
        return {errors: [`Subpath "${subpath}" not found on package "${pkg.name}"`]};
    }

    if (pkg.version !== version) {
        const error = `The requested version "${version}" differs ` +
            `from the version of the installed package "${pkg.version}"`;
        return {errors: [error]};
    }

    const done = output => {
        mcached.set(key, output);
        return output;
    }

    // Resolve the package as a universal package
    if (pkg.json.uimport) {
        return done(await require('./uimport')(pkg, mode, version));
    }

    const exists = file => new Promise(r => fs.access(file)
        .then(() => r(true))
        .catch(() => r(false)));

    const cacheFile = join(paths.cache, bundle, `${version}+${mode}.js`);
    if (await exists(cacheFile)) {
        try {
            const build = await fs.readFile(cacheFile, 'utf8');
            const {errors, dependencies, code, warnings} = JSON.parse(build);
            return done({code, dependencies, errors, warnings, version});
        }
        catch (exc) {
            console.log(`Error loading "${bundle}" from cache`);
        }
    }

    const specs = {cwd: paths.cwd, temp: paths.temp};
    const {code, errors, warnings, dependencies} = await require('./build')(bundle, version, mode, specs);

    // Save into cache
    await fs.mkdir(dirname(cacheFile), {recursive: true});
    await fs.writeFile(cacheFile, JSON.stringify({code, dependencies, errors, warnings}), 'utf8');

    return done({code, errors, warnings, version, dependencies});
}
