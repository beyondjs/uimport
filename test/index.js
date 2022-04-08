require('colors');
const uimport = require('..');
const p = require('path');
const fs = require('fs').promises;

// const cases = require('./cases');
// const cases = new Set(['highlight-ts']);
// const cases = new Set(['react-dom']);
// const cases = new Set(['framer-motion']);
// const cases = new Set(['framesync']);
// const cases = new Set(['engine.io-parser']);
const cases = new Set(['socket.io-client']);

const paths = {
    cwd: __dirname, // The working directory
    temp: '.uimport/temp', // Directory relative to the working directory, where uimport will create temporary files
    cache: p.join(__dirname, '.uimport/cache')
};

(async () => {
    const report = {errors: new Map()};

    for (const bundle of cases) {
        console.log(`Processing bundle: "${bundle}"`);
        const {errors, code} = await uimport(bundle, paths);
        if (errors) {
            console.log(`\tErrors found on bundle "${bundle}"`.red)
            report.errors.set(bundle, errors);
            continue;
        }

        const target = p.join(__dirname, 'html/packages', `${bundle}.js`);
        await fs.mkdir(p.dirname(target), {recursive: true});
        await fs.writeFile(target, code, 'utf8');
        console.log(`\tBundle: "${bundle}" saved`);
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
