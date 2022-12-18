module.exports = async function (route, res) {
    'use strict';

    const {specifier, vdir, pathname} = route;

    if (vdir === 'info') return await require('./info')(specifier, res);
    if (vdir === 'files') return await require('./files')(specifier, res);
    if (vdir === 'modules') return await require('./modules')(specifier, route, res);
    if (vdir === 'dependencies') return await require('./dependencies')(pathname, route, res);

    res.status(404).send('Error: (404) - resource not found').end();
}
