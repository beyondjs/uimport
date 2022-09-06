require('colors');
const uimport = require('..');
const p = require('path');
const fs = require('fs').promises;

// const cases = require('./cases');
// const cases = new Set(['cheerio@1.0.0-rc.12']);
// const cases = new Set(['svelte@3.46.4/store']);
// const cases = new Set(['redux']);
// const cases = new Set(['svelte/store']);
// const cases = new Set(['highlight-ts']);
// const cases = new Set(['svelte/store', 'react-dom']);
// const cases = new Set(['react-dom']);
// const cases = new Set(['d3']);
// const cases = new Set(['vue']);
// const cases = new Set(['framer-motion']);
// const cases = new Set(['tslib']);
// const cases = new Set(['framesync']);
// const cases = new Set(['firebase/app']);
// const cases = new Set(['@mui/utils']);
// const cases = new Set(['@mui/material/button']);
// const cases = new Set(['socket.io-client']);
// const cases = new Set(['socket.io-parser']);
// const cases = new Set(['engine.io-parser']);
const cases = new Set(['engine.io-client']);
// const cases = new Set(['@beyond-js/kernel/core']);
// const cases = new Set(['@beyond-js/widgets/layout']);

const UISpecs = {
    cwd: __dirname, // The working directory
    temp: p.join(__dirname, '.uimport/temp'),
    cache: p.join(__dirname, '.uimport/cache'),
    versions: true,
    // prePath: 'packages'
};
const modes = ['sjs', 'amd', 'esm'];

(async () => {
    const report = {errors: new Map()};
    const generated = new Set();

    const build = async (bundle, mode) => {
        if (generated.has(bundle)) return; // Bundle already generated

        console.log(`Processing bundle: "${bundle}"`);
        const {errors, code, pkg, subpath, version, dependencies} = await uimport(bundle, mode, UISpecs);

        if (errors) {
            console.log(`Errors found on bundle "${bundle}"`.red)
            report.errors.set(bundle, errors);
            return;
        }

        const file = `${mode}/${pkg.name}${version ? `@${version}` : ''}` + (subpath ? `/${subpath.slice(2)}.js` : '.js');
        const target = p.join(__dirname, 'html/packages', file);
        await fs.mkdir(p.dirname(target), {recursive: true});
        await fs.writeFile(target, code, 'utf8');
        console.log(`\tBundle: "${bundle}" saved`);

        dependencies.length && console.log('\tDependencies:', dependencies.map(({id}) => id));
        for (const {id} of dependencies) {
            for (const mode of modes) {
                await build(id, mode);
            }
        }
    }

    for (const bundle of cases) {
        for (const mode of modes) {
            await build(bundle, mode);
        }
    }

    console.log('\n---\n');

    if (report.errors.size) {
        console.log(`Errors found on ${report.errors.size} bundles:\n`.red);
        report.errors.forEach((errors, bundle) => {
            console.log(`Errors found on bundle "${bundle}":`.red)
            errors.forEach(error => console.log(`\t- ${error}`.red));
        });
    }
    else {
        console.log('All bundles were built ok!');
    }
})().catch(exc => console.error(exc.stack));
