const SpecifierParser = require('@beyond-js/specifier-parser');

module.exports = async function (req, res) {
    'use strict';

    res.set('Access-Control-Allow-Origin', '*');

    const {specifier, error, vdir, pathname} = (() => {
        const {pathname, vdir} = (() => {
            let pathname = req.path.slice(1);
            if (!pathname) return {pathname};

            const split = pathname.split('/');
            const vdir = split.shift();
            pathname = split.join('/');
            return {vdir, pathname};
        })();

        if (vdir === 'dependencies') return {vdir, pathname};

        const vdirs = ['info', 'modules', 'files'];
        if (!vdirs.includes(vdir)) return {error: 'Resource not found'};
        if (!pathname) return {error: 'Package name and version must be set'};

        const specifier = new SpecifierParser(pathname);
        if (!specifier.valid) {
            const {value, error} = specifier;
            return {error: `Module specifier "${value}" is invalid: "${error}"`};
        }
        if (!specifier.pkg) {
            return {error: 'Package name must be set'};
        }
        return {vdir, specifier};
    })();
    if (error) {
        res.status(404).send(`Error: (404) - ${error}`).end();
        return;
    }

    if (vdir === 'info') return await require('./info')(specifier, res);
    if (vdir === 'files') return await require('./files')(specifier, res);
    if (vdir === 'modules') return await require('./modules')(specifier, req, res);
    if (vdir === 'dependencies') return await require('./dependencies')(pathname, req, res);

    res.status(404).send('Error: (404) - resource not found').end();
}
