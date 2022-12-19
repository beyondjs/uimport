const source = (require('./source'));

module.exports = async function (dependencies, res) {
    await dependencies.load({load: true});

    const {loaded, valid, errors, application, pkg, version} = dependencies;
    const id = application ? `application "${application}"` : `package "${pkg}@${version}"`;
    if (!loaded) {
        res.status(404).send(`Error: (404) - Dependencies of ${id} not found`).end();
        return;
    }
    if (!valid) {
        res.status(500).send(`Error: (500) - Errors found on ${id} dependencies": ${[...errors]}`).end();
        return;
    }

    const optimized = (() => {
        const map = new Map();
        dependencies.list.forEach(({pkg, version}) => map.set(pkg, version));
        return JSON.stringify([...map]);
    })();

    const script = source.replace(/\/\*(\s*)dependencies(\s*)\*\//, optimized);

    res.set('Content-Type', 'application/javascript');
    res.send(script).end();
}
