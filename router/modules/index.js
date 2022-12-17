const Packager = require('@beyond-js/uimport/packager');
const mformat = require('@beyond-js/mformat');

module.exports = async function (specifier, req, res) {
    if (!specifier.version) {
        res.status(404).send('Error: (404) - Package version must be set').end();
        return;
    }

    const {query} = req;
    const options = {
        platform: query.platform ? query.platform : 'browser',
        format: query.format ? query.format : 'esm',
        minify: query.min !== void 0,
        types: query.types !== void 0,
        css: query.css !== void 0,
        map: query.map !== void 0,
        logs: query.logs !== void 0
    };

    const packager = new Packager(specifier, options.platform);
    if (options.logs) {
        const entries = (await packager.logs.get())[0].reverse();
        let html = `<h1>"${specifier.value}" logs</h1>`;

        !entries.length && (html += 'No logs were found');

        entries.forEach(entry => {
            const {metadata, data} = entry;
            const {severity} = metadata;
            if (typeof data !== 'string') return;

            html += `<div class="${severity.toLowerCase()}">${data}</div>`;
        });

        res.send(html).end();
        return;
    }

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
