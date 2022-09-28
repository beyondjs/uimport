const {join} = require('path');

module.exports = async function (pkg, dir, dependencies) {
    const plugin = {
        name: 'uimport',
        setup(build) {
            build.onResolve({filter: /./}, async args => {
                const {kind} = args;
                if (kind === 'entry-point') {
                    return {namespace: 'entry-point', path: 'app.js'};
                }
                return {namespace: 'resource', path: args.path};
            });

            build.onLoad({filter: /./}, async args => {
                if (args.namespace === 'entry-point') {
                    return {
                        contents: `export * from 'react-dom';`
                    }
                }

                console.log('plugin => onLoad args:', args);
                // let text = await fs.promises.readFile(args.path, 'utf8')
                // return {
                //     contents: JSON.stringify(text.split(/\s+/)),
                //     loader: 'json',
                // }
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
