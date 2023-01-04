const Packager = require('@beyond-js/uimport/packager');

module.exports = async function (specifier, options, res) {
    const packager = new Packager(specifier, options.platform);

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
}
