const packages = require('@beyond-js/uimport/packages-content');
const mime = require('mime-types');

module.exports = async function (specifier, res) {
    if (!specifier.version) {
        res.status(404).send('Error: (404) - Package version must be set').end();
        return;
    }

    const pcontent = packages.get(specifier.pkg, specifier.version);
    await pcontent.process();

    let {valid, found, error, processing, files} = pcontent;
    if (!found) {
        res.status(404).send(`Error: (404) - Package "${specifier.vpkg}" not found`).end();
        return;
    }
    if (!valid) {
        res.status(500).send(`Error: (500) - Error on package "${specifier.vpkg}": ${error}`).end();
        return;
    }

    const path = specifier.subpath.slice(2); // Remove the './' from the subpath
    if (!path) {
        const json = {};
        files.forEach((file, path) => json[path] = file);
        res.send(json).end();
        return;
    }

    if (!files.has(path)) {
        res.status(404).send(`Error: (404) - File "${path}" not found`).end();
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
