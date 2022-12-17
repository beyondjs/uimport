const packages = require('@beyond-js/uimport/packages-registry');
const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');

module.exports = async function (specifier, res) {
    if (!specifier.version) {
        res.status(404).send('Error: (404) - Package version must be set').end();
        return;
    }

    const dependencies = new DependenciesTree({pkg: specifier.pkg, version: specifier.version});
    await dependencies.process({load: true});

    const pkg = packages.get(specifier.pkg);
    const vpkg = await pkg.versions.get(specifier.version);
    if (!vpkg) {
        const {version} = specifier;
        res.status(404).send(`Error: (404) - Package version "${version}" not found`).end();
        return;
    }

    await vpkg.load();
    const content = (() => {
        const json = (() => {
            let json = vpkg.pkg.toJSON();
            delete json.versions;

            /**
             * Merge the package data with the vpackage data
             */
            json = Object.assign(json, vpkg.toJSON());

            /**
             * The flat dependencies specified in the package.json (not the tree dependencies)
             * Process the dependencies from the stored structure (the required by firestore) to a more
             * standard format
             * @type {{config?: {}}}
             */
            json.dependencies = ((dependencies) => {
                if (!dependencies) return {};

                const output = {};
                json.dependencies?.forEach(({key, value}) => output[key] = value);
                return {config: output};
            })(json.dependencies);

            /**
             * Process the exports from the stored structure (the required by firestore) to a more
             * standard format
             * @type {{}|{}}
             */
            json.exports = ((exports) => {
                if (!exports) return {};

                const output = {};
                json.exports?.forEach(({key, value}) => output[key] = value);
                return output;
            })(json.exports);

            return json;
        })();

        /**
         * Set the dependencies tree
         */
        json.dependencies.tree = dependencies.object[specifier.vpkg];
        return json;
    })();

    res.send(content).end();
}
