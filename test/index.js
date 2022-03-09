const uimport = require('..');
const p = require('path');
const fs = require('fs').promises;

const paths = {
    cwd: __dirname, // The working directory
    temp: '.uimport/temp', // Directory relative to the working directory, where uimport will create temporary files
    cache: p.join(__dirname, '.uimport/cache')
};

(async () => {
    const report = {errors: new Map()};

    for (const bundle of require('./cases')) {
        console.log(`Processing bundle: "${bundle}"`);
        const {errors, code} = await uimport(bundle, paths);
        if (errors) {
            console.log(`Errors found on bundle "${bundle}":`)
            errors.forEach(error => console.log(`\t- ${error}`));
            report.errors.set(bundle, errors);
            return;
        }

        const target = p.join(__dirname, 'html/packages', `${bundle}.js`);
        await fs.mkdir(p.dirname(target), {recursive: true});
        await fs.writeFile(target, code, 'utf8');
        console.log(`Bundle: "${bundle}" saved`);
    }

    console.log('\n---\n');

    if (report.errors.size) {
        console.log(`Errors found on ${report.errors.size} bundles:\n`);
        report.errors.forEach((errors, bundle) => {
            console.log(`Errors found on bundle "${bundle}":`)
            errors.forEach(error => console.log(`\t- ${error}`));
        });
    }
    else {
        console.log('All bundles were built ok!');
    }
})().catch(exc => console.error(exc.stack));
