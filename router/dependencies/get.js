module.exports = async function (dependencies, res) {
    await dependencies.load({load: true});

    const {loaded, valid, errors} = dependencies;
    if (!loaded) {
        res.status(404).send(`Error: (404) - Application dependencies "${application}" not found`).end();
        return;
    }

    const json = {};
    valid ? (json.dependencies = dependencies.object) : (json.errors = errors);
    res.send(json).end();
}
