const uimport = require('..');
const p = require('path');

const paths = {
    cwd: __dirname, // The working directory
    temp: '.temp', // Directory relative to the working directory, where uimport will create temporary files
    cache: p.join(__dirname, 'html/packages')
};

(async () => {
    for (const bundle of require('./cases')) {
        await uimport(bundle, paths);
    }
})().catch(exc => console.error(exc.stack));
