require('./utils');
const fs = require('fs').promises;
const {join, dirname} = require('path');

// Save in memory cache the already accessed packages
const mcached = new Map();

/**
 * Generate the esm bundled version of a package/subpath
 *
 * @param pkg {*} The package container of the bundle being processed
 * @param vspecifier {*} The parsed vspecifier
 * @param mode {string} Can be 'esm' or 'sjs', 'amd'
 * @param UISpecs {{cwd: string, cache: string, temp: string, versions:boolean}}
 * @return {Promise<{errors: [string]}|any>}
 */
module.exports = async function (pkg, vspecifier, mode, UISpecs) {
    if (!UISpecs || typeof UISpecs.cwd !== 'string' || typeof UISpecs.temp !== 'string' || typeof UISpecs.cache !== 'string') {
        return {errors: ['Invalid parameters']};
    }
    mode = mode ? mode : 'esm';
    if (!['esm', 'sjs', 'amd'].includes(mode)) throw new Error('Invalid mode parameter');

    const {subpath, specifier} = vspecifier;

    // Take the version from the installed package if not specified
    const version = !vspecifier.version && !pkg.error ? pkg.version : vspecifier.version;

    // Check if package is in memory cache
    // The bundle could have been generated in a version that cannot be accessed directly, because it was still
    // generated as a dependency of another package (dependencies of packages with different versions)
    const key = `${vspecifier.pkg}/${version}/${vspecifier.subpath}/+${mode}`;
    if (mcached.has(key)) return mcached.get(key);

    if (pkg.error) return {errors: [`Package "${pkg.name}" not found`]};

    if (!pkg.json.uimport && subpath && !pkg.subpaths.has(subpath) && !pkg.subpackages.has(subpath)) {
        return {errors: [`Subpath "${subpath}" not found on package "${pkg.name}"`]};
    }

    if (pkg.version !== version) {
        const error = `The requested version "${version}" differs ` +
            `from the version of the installed package "${pkg.version}"`;
        return {errors: [error]};
    }

    const done = output => {
        output = Object.assign({pkg, subpath}, output);
        mcached.set(key, output);
        return output;
    }

    const exists = file => new Promise(r => fs.access(file)
        .then(() => r(true))
        .catch(() => r(false)));

    const cacheFile = join(UISpecs.cache, specifier, `${version}+${mode}.js`);
    if (await exists(cacheFile)) {
        try {
            const build = await fs.readFile(cacheFile, 'utf8');
            const {errors, dependencies, code, warnings} = JSON.parse(build);
            return done({code, dependencies, errors, warnings, version});
        }
        catch (exc) {
            console.log(`Error loading "${specifier}" from cache`);
        }
    }

    // const specs = {cwd: UISpecs.cwd, temp: UISpecs.temp, versions: UISpecs.versions};
    const {code, errors, warnings, dependencies} = await require('./build')(specifier, version, mode, UISpecs);

    // Save into cache
    await fs.mkdir(dirname(cacheFile), {recursive: true});
    await fs.writeFile(cacheFile, JSON.stringify({code, dependencies, errors, warnings}), 'utf8');

    return done({code, errors, warnings, version, dependencies});
}