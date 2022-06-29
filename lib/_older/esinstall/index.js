const {install} = require('esinstall');
const {join, dirname} = require('path');
const fs = require('fs').promises;
const mformat = require('beyond/mformat');

/**
 * Package external bundles.
 * Legacy uimport call function was: return await require('uimport')(bundle, paths);
 *
 * @param bundle {string} The bundle to package
 * @param paths {{cwd: string, temp: string, cache: string}}
 * @param pjson {object} The package.json parsed as an object
 * @param mode {string} Can be 'es6', 'sjs', 'cjs', 'amd'
 * @return {Promise<{code?: string, map?: string, errors?: [string]}>}
 */
module.exports = async function (bundle, paths, pjson, mode) {
    'use strict';

    if (!['amd', 'cjs', 'sjs', 'es6'].includes(mode)) throw  new Error('Invalid parameters');

    const {cwd, temp} = paths;
    const dest = join(cwd, temp);
    const files = {
        code: join(dest, `${bundle}.js`),
        map: join(dest, `${bundle}.js.map`)
    };

    const cached = {requested: join(paths.cache, bundle, `${pjson.version}.${mode}.json`)};
    mode !== 'es6' && (cached.es6 = join(paths.cache, bundle, `${pjson.version}.es6.json`));

    const exists = async file => {
        try {
            await fs.access(file)
            return true;
        }
        catch (exc) {
            return false;
        }
    }

    let errors;

    // Check if bundle exists in cache
    if (await exists(cached.requested)) {
        try {
            const read = await fs.readFile(cached.requested, 'utf8');
            return JSON.parse(read);
        }
        catch (exc) {
            console.log(`Error loading external bundle "${bundle}" from cache: ${exc.message}`);
        }
    }

    const write = async ({file, code, map, errors}) => {
        // Save to cache
        try {
            await fs.mkdir(dirname(file), {recursive: true});
            await fs.writeFile(file, JSON.stringify({code, map, errors}));
        }
        catch (exc) {
            console.log(`Error saving package "${bundle}" into cache. ${exc.message}`);
        }
    }

    const done = async ({code, map, errors}) => {
        await write({file: cached.es6, code, map, errors});

        if (mode !== 'es6') {
            map = typeof map === 'string' ? JSON.parse(map) : map;
            ({errors, code, map} = errors ? {errors} : mformat({code, map, mode}));
            map = typeof map === 'object' ? JSON.stringify(map) : map;

            const file = cached.requested;
            await write({file, code, map, errors});
        }
        return {code, map, errors};
    }

    // Check if mode is different to es6, and es6 is in cache (only transpile is required)
    if (errors && mode !== 'es6' && (await exists(cached.es6))) {
        // It is only required to transpile the previously generated package
        try {
            const read = await fs.readFile(cached.es6, 'utf8');
            const parsed = JSON.parse(read);
            return await done(parsed);
        }
        catch (exc) {
            console.log(`Error loading external bundle "${bundle}" from cache: ${exc.message}`);
        }
    }

    try {
        await install([bundle], {cwd, dest, sourcemap: true});
    }
    catch (exc) {
        return {errors: [exc.message]};
    }

    // Check if packaged files was created
    if (!(await exists(files.code))) return await done({errors: [`File ${files.code} not created`]});
    if (!(await exists(files.map))) return await done({errors: [`File ${files.map} not created`]});

    const read = async (file) => {
        try {
            const content = await fs.readFile(file, 'utf8');
            return {content};
        }
        catch (exc) {
            return {errors: [`Error packaging "${bundle}". Reading file "${file}": ${exc.message}`]};
        }
    }

    let code, map;
    ({content: code, errors} = await read(files.code, 'utf8'));
    if (errors) return await done({errors});

    ({content: map, errors} = await read(files.map, 'utf8'));
    if (errors) return await done({errors});

    return await done({code, map, errors});
}
