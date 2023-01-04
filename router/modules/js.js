const Packager = require('@beyond-js/uimport/packager');
const mformat = require('@beyond-js/mformat');

module.exports = async function (specifier, options, res) {
    const packager = new Packager(specifier, options.platform);
    await packager.process();
    let {valid, found, errors} = packager;
    if (!valid) {
        const status = found ? 500 : 404;
        res.status(status).send({errors}).end();
        return;
    }

    if (!['sjs', 'esm', 'cjs', 'amd'].includes(options.format)) {
        res.status(404).send(`Error (404) - Format parameter "${options.format}" is invalid`).end();
        return;
    }

    let code, map;
    ({code, map, errors} = mformat({
        format: options.format, minify: options.minify,
        code: packager.code, map: packager.map
    }));

    if (errors?.length) {
        res.status(500).send({errors}).end();
        return;
    }

    if (options.map) {
        res.set('Content-Type', 'application/json');
        res.send(map).end();
    }
    else {
        res.set('Content-Type', 'application/javascript');
        res.send(code).end();
    }
}
