const uimport = require('..');
const p = require('path');

const paths = {
    cwd: __dirname, // The working directory
    temp: '.temp', // Directory relative to the working directory, where uimport will create temporary files
    cache: p.join(__dirname, 'html/packages')
};

(async () => {
    const errors = new Map();
    for (const bundle of require('./cases')) {
        const response = await uimport(bundle, paths);
        response.errors && errors.set(bundle, response.errors);
    }

    if (errors.size) {
        console.log(`Errors found on ${errors.size} bundles:\n`);
        errors.forEach((errors, bundle) => {
            console.log(`Errors found on bundle "${bundle}":`)
            errors.forEach(error => console.log(`\t- ${error}`));
        });
    }
})().catch(exc => console.error(exc.stack));
