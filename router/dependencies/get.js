const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');

module.exports = async function (id, res) {
    const dependencies = new DependenciesTree({id});
    await dependencies.load({load: true});

    const {loaded, valid, errors} = dependencies;
    if (!loaded) {
        res.status(404).send(`Error: (404) - Application dependencies "${id}" not found`).end();
        return;
    }

    const json = {};
    valid ? (json.dependencies = dependencies.object) : (json.errors = errors);
    res.send(json).end();
}
