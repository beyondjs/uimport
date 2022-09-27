const path = require('path');
const Registry = require('uimport/registry');
const Dependencies = require('uimport/dependencies');

/**
 * Packages specification
 * @type {{cache}}
 */
const specs = (() => {
    const cache = path.join(__dirname, './.uimport/registry');
    return {cache};
})();
const registry = new Registry(specs);

const dependencies = new Map([['react-dom', '~18.2']]);
const tree = new Dependencies(dependencies, registry);

(async () => {
    await tree.analyze();
    console.log(tree.list, tree.errors);
})().catch(exc => console.log(exc.stack));
