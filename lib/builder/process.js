const {join, resolve} = require('path');
const fs = require('fs').promises;
require('colors');

module.exports = async function (pkg, version, subpath, tree, downloads) {
    const building = {
        pkg, version, subpath,
        namespace: `uimport:${pkg}@${version}`,
        vspecifier: `${pkg}@${version}` + subpath ? `/${subpath}` : ''
    };

    const plugin = {
        name: 'uimport',
        setup(build) {
            build.onResolve({filter: /./}, async args => {
                const {kind, importer} = args;
                const {namespace, resource} = (() => {
                    if (kind === 'entry-point') return {namespace: building.namespace, resource: building.subpath};

                    if (args.path.startsWith('.')) {
                        const resource = resolve(importer, args.path);
                        return {namespace: args.namespace, resource};
                    }

                    const split = args.path.split('/');
                    const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
                    const subpath = split.join('/');
                    const version = '1';

                    const namespace = `uimport:${pkg}@${version}`;
                    const resource = subpath ? `./${subpath}` : './';

                    return {namespace, resource};
                })();

                console.log(`"${importer}"`.bold.yellow + ' imports ' + `"${resource}"`.bold.yellow + '\n' +
                    `\t* from namespace: "${namespace}"\n` +
                    `\t* kind: "${kind}"\n`);

                const vname = namespace.slice('uimport:'.length);
                const vpackage = tree.list.get(vname);
                if (!vpackage) throw new Error(`Package "${vname}" not found`);

                const resolved = vpackage.exports.solve(resource, {platform: 'web', kind});

                /**
                 * Check if we are resolving the resource being requested
                 */
                if (namespace === building.namespace && resource === building.subpath) {
                    if (!resolved) throw new Error(`Bundle "${building.vspecifier}" not found`);
                    return {namespace, path: resource};
                }

                /**
                 * Check if it is an external resource
                 */
                if (resolved) return {external: true};

                /**
                 * If the path being requested is not an external bundle, then include it in the package
                 */
                return {namespace, path: resource};
            });

            build.onLoad({filter: /./}, async args => {
                const {path: resource, namespace} = args;

                if (!namespace.startsWith('uimport:')) throw new Error('Namespace should start with "uimport:"');

                const vname = namespace.slice('uimport:'.length);
                const download = downloads.get(vname);
                const vpackage = tree.list.get(vname);

                const path = (() => {
                    const path = join(download.target.dir, resource);

                    // Package files can be overwritten when the platform is "browser"
                    return vpackage.browser.has(path) ? vpackage.browser.get(path) : path;
                })();

                const contents = await fs.readFile(path, 'utf8');
                return {contents};
            });
        }
    }

    await require('esbuild').build({
        entryPoints: ['app.js'],
        bundle: true,
        outfile: 'out.js',
        plugins: [plugin]
    }).catch(exc => console.error(exc.stack));
}
