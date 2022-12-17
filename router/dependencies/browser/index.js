const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');
const source = (require('./source'));

module.exports = async function (id, res) {
    const dependencies = new DependenciesTree({id});
    await dependencies.load({load: true});

    const {loaded, valid, errors} = dependencies;
    if (!loaded) {
        res.status(404).send(`Error: (404) - Application dependencies "${id}" not found`).end();
        return;
    }
    if (!valid) {
        res.status(500).send(`Error: (500) - Errors found on application dependencies: ${[...errors]}`).end();
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
