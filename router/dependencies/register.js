const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');

module.exports = async function (id, route, res) {
    if (!route.body) {
        res.status(404).send('Dependencies configuration must be specified').end();
        return;
    }

    const dependencies = new DependenciesTree({id, json: route.body});
    await dependencies.process({load: false});

    const {valid, errors} = dependencies;
    const json = {};
    valid ? (json.dependencies = dependencies.object) : (json.errors = errors);
    res.send(json).end();
}
