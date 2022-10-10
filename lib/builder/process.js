const {join, dirname, sep} = require('path');
const fs = require('fs').promises;
require('colors');

module.exports = async function (pkg, version, subpath, tree, downloads) {
    subpath = subpath === './' ? '.' : subpath;
    subpath = subpath ? subpath : '.';
    subpath = subpath === '.' || subpath.startsWith('./') ? subpath : `./${subpath}`;

    const building = {
        pkg, version, subpath,
        namespace: `uimport:${pkg}@${version}`,
        vspecifier: `${pkg}@${version}` + (subpath === '.' ? '' : subpath.slice(1))
    };

    const plugin = {
        name: 'uimport',
        setup(build) {
            build.onResolve({filter: /./}, async args => {
                const {kind, importer} = args;
                const {namespace, resource} = (() => {
                    if (kind === 'entry-point') return {namespace: building.namespace, resource: building.subpath};

                    if (args.path.startsWith('./')) {
                        let resource = './' + join(dirname(importer), args.path);
                        resource = sep !== '/' ? resource.replace(/\\/g, '/') : resource;
                        return {namespace: args.namespace, resource};
                    }

                    const split = args.path.split('/');
                    const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
                    const subpath = split.join('/');
                    const version = (() => {
                        console.log('... solving dependency version!');
                    })();

                    const namespace = `uimport:${pkg}@${version}`;
                    const resource = subpath ? `./${subpath}` : '.';

                    return {namespace, resource};
                })();

                console.log(
                    `"${kind === 'entry-point' ? 'entry point' : importer}"`.bold.yellow +
                    ' imports ' + `"${resource}"`.bold.yellow + '\n' +
                    `\t* namespace: "${namespace}"\n` +
                    `\t* kind: "${kind}"\n`);

                const vname = namespace.slice('uimport:'.length);
                const vpackage = tree.list.get(vname);
                if (!vpackage) throw new Error(`Package "${vname}" not found`);

                /**
                 * Check if we are resolving the resource being requested
                 */
                if (namespace === building.namespace && resource === building.subpath) {
                    const resolved = vpackage.exports.solve(resource, {platform: 'web', kind});
                    if (!resolved) throw new Error(`Bundle "${building.vspecifier}" not found`);
                    return {namespace, path: resolved};
                }

                /**
                 * Check if it is an external resource
                 */
                const found = vpackage.exports.solve(resource, {platform: 'web', kind});
                if (found) return {external: true};

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

                const file = (() => {
                    const file = (() => {
                        const file = join(download.target.dir, resource);
                        return sep !== '/' ? file.replace(/\\/g, '/') : file;
                    })();

                    // Package files can be overwritten when the platform is "browser"
                    return vpackage.browser.has(file) ? vpackage.browser.get(file) : file;
                })();

                const contents = await fs.readFile(file, 'utf8');
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
