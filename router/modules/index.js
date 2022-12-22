const Packager = require('@beyond-js/uimport/packager');
const mformat = require('@beyond-js/mformat');

module.exports = async function (specifier, options, res) {
    res.set('Access-Control-Allow-Origin', '*');

    if (!specifier.version) {
        res.status(404).send('Error: (404) - Package version must be set').end();
        return;
    }

    const packager = new Packager(specifier, options.platform);
    if (options.logs) {
        const {entries, error} = await (async () => {
            const entries = await packager.logger.get();
            const {error} = packager.logger;
            return error ? {entries: [], error} : {entries: entries.reverse()};
        })();

        let html = `<h1>"${specifier.value}" logs</h1>`;

        error && (html += `Error found getting logs: "${error}"`);
        !error && !entries.length && (html += 'No logs were found');

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
