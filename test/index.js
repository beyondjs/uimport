const uimport = require('..');
const p = require('path');

const absWorkingDir = __dirname;
const cacheDir = p.join(__dirname, 'html/packages');

(async () => {
    for (const bundle of require('./cases')) {
        await uimport(bundle, absWorkingDir, cacheDir);
    }
})().catch(exc => console.error(exc.stack));
