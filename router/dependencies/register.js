const Installer = require('@beyond-js/uimport/installer');

module.exports = async function (route, res) {
    if (!route.body) {
        res.status(404).send('Dependencies configuration must be specified').end();
        return;
    }

    const installer = new Installer({application: route.application, json: route.body});
    await installer.process({update: true});

    const {valid, errors} = installer;
    const json = {valid, errors};
    res.send(json).end();
}
