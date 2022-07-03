require('colors');
const uimport = require('..');
const p = require('path');
const fs = require('fs').promises;

const cases = require('./cases');
// const cases = new Set(['svelte@3.46.4/store']);
// const cases = new Set(['redux']);
// const cases = new Set(['svelte/store']);
// const cases = new Set(['highlight-ts']);
// const cases = new Set(['svelte/store', 'react-dom']);
// const cases = new Set(['d3']);
// const cases = new Set(['vue']);
// const cases = new Set(['framer-motion']);
// const cases = new Set(['tslib']);
// const cases = new Set(['framesync']);
// const cases = new Set(['firebase/app']);
// const cases = new Set(['socket.io-client']);
// const cases = new Set(['socket.io-parser']);
// const cases = new Set(['engine.io-parser']);
// const cases = new Set(['@mui/utils']);
// const cases = new Set(['@mui/material/button']);

const paths = {
    cwd: __dirname, // The working directory
    temp: p.join(__dirname, '.uimport/temp'),
    cache: p.join(__dirname, '.uimport/cache')
};
const mode = 'esm';

(async () => {
    const report = {errors: new Map()};
    const generated = new Set();

    const build = async (bundle) => {
        if (generated.has(bundle)) return; // Bundle already generated

        console.log(`Processing bundle: "${bundle}"`);
        generated.add(bundle);
        const {errors, code, version, dependencies} = await uimport(bundle, mode, paths);

        if (errors) {
            console.log(`Errors found on bundle "${bundle}"`.red)
            report.errors.set(bundle, errors);
            return;
        }

        const file = bundle.includes('@') ? `${bundle}.js` : `${bundle}@${version}.js`;
        const target = p.join(__dirname, 'html/packages', file);
        await fs.mkdir(p.dirname(target), {recursive: true});
        await fs.writeFile(target, code, 'utf8');
        console.log(`\tBundle: "${bundle}" saved`);

        dependencies.length && console.log('\tDependencies:', dependencies.map(({id}) => id));
        for (const {id} of dependencies) {
            await build(id);
        }
    }

    for (const bundle of cases) {
        await build(bundle);
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
