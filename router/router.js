module.exports = async function (route, res) {
    'use strict';

    const {specifier, vdir, options} = route;

    if (vdir === 'info') return await require('./info')(specifier, res);
    if (vdir === 'files') return await require('./files')(specifier, res);
    if (vdir === 'modules') return await require('./modules')(specifier, options, res);

    const d = ['dependencies', 'app.dependencies'];
    if (d.includes(vdir)) return await require('./dependencies')(route, res);

    res.status(404).send('Error: (404) - resource not found').end();
}
