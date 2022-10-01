const {join, dirname} = require('path');
const fs = require('fs').promises;

module.exports = async function (pkg, version, tree, downloads) {
    const building = {pkg, version};

    const plugin = {
        name: 'uimport',
        setup(build) {
            build.onResolve({filter: /./}, async args => {
                const {kind, path: resource, importer, namespace} = args;
                if (kind === 'entry-point') {
                    return {namespace: 'entry-point', path: 'app.js'};
                }

                if (resource.startsWith('.')) {
                    if (!namespace.startsWith('uimport:')) throw new Error('Invalid namespace received');

                    const file = `./${join(dirname(importer), resource)}`;
                    const vname = namespace.slice('uimport:'.length);
                    const vpackage = tree.list.get(vname);
                    if (!vpackage) throw new Error(`Package "${vname}" not found`);

                    const path = vpackage.routes.resolve(file, {platform: 'web'});
                    return {namespace, path};
                }
                else {
                    const split = resource.split('/');
                    const requiring = {};
                    requiring.pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
                    requiring.subpath = split.join('/');

                    const vrequired = building.pkg === requiring.pkg ? version : void 0;
                    const vname = `${requiring.pkg}@${vrequired}`;
                    const vpackage = tree.list.get(vname);
                    if (!vpackage) throw new Error(`Package "${vname}" not found`);

                    const path = vpackage.exports.solve(requiring.subpath, {platform: 'web'});
                    return {namespace: `uimport:${vname}`, path};
                }
            });

            build.onLoad({filter: /./}, async args => {
                const {namespace} = args;
                if (namespace === 'entry-point') {
                    return {contents: `export * from '${pkg}';`}
                }
                if (namespace && namespace.startsWith('uimport:')) {
                    const vname = namespace.slice('uimport:'.length);
                    const download = downloads.get(vname);

                    const path = join(download.target.dir, args.path);
                    const contents = await fs.readFile(path, 'utf8');
                    return {contents};
                }

                // Code should never get here
                throw new Error('Unexpected error');
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
