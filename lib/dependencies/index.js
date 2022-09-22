import Packages from './packages/index.js';
import path from 'node:path';
import Tree from './tree.js';

const specs = (() => {
    const {url} = import.meta;
    if (!url.startsWith('file:/')) throw new Error('Module expected to work in node or deno environment');

    const dirname = path.dirname(url.substr('file:/'.length));
    const cache = path.join(dirname, '../../test/.uimport/registry');
    return {cache};
})();
const packages = new Packages(specs);

const dependencies = new Map([['react', '~16.14']]);
const tree = new Tree(dependencies, packages);

await (async () => {
    await tree.analyze();
})().catch(exc => console.log(exc.stack));
