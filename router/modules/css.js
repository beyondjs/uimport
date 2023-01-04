const packages = require('@beyond-js/uimport/packages-content');
const registry = require('@beyond-js/uimport/packages-registry');
const mime = require('mime-types');

module.exports = async function (specifier, options, res) {
    if (!specifier.version) {
        res.status(404).send('Error: (404) - Package version must be set').end();
        return;
    }

    const pkg = registry.get(specifier.pkg);
    const vpkg = await pkg.versions.get(specifier.version);
    if (!vpkg) {
        const {version} = specifier;
        res.status(404).send(`Error: (404) - Package version "${version}" not found`).end();
        return;
    }

    await vpkg.load();
    const {subpath} = specifier;
    if (!vpkg.exports.has(subpath)) {
        res.status(404).send(`Error (404) - Subpath "${subpath}" is not not registered on package "${specifier.vpkg}"`);
        return;
    }
    const conditional = vpkg.exports.get(subpath);
    if (typeof conditional.css !== 'string') {
        res.status(404).send(`Error (404) - Subpath "${subpath}" does not has a "css" entry`);
        return;
    }
    const path = conditional.css.startsWith('./') ? conditional.css.slice(2) : conditional.css;

    const pcontent = packages.get(specifier.pkg, specifier.version);
    await pcontent.process();

    let {valid, found, error, files} = pcontent;
    if (!found) {
        res.status(404).send(`Error: (404) - Package "${specifier.vpkg}" not found on storage`).end();
        return;
    }
    if (!valid) {
        res.status(500).send(`Error: (500) - Error on package "${specifier.vpkg}": ${error}`).end();
        return;
    }

    if (!files.has(path)) {
        res.status(404).send(`Error: (404) - File "${path}" specified in css conditional has not been found`).end();
        return;
    }

    const file = files.get(path);
    await file.process();

    let content;
    ({valid, error, content} = file);

    if (valid) {
        res.set('Content-Type', mime.lookup(path));
        res.send(content).end();
    }
    else {
        res.status(500).send(`Error: (500) - Error reading file "${path}": ${error}`).end();
    }
}
