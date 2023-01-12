const packages = require('@beyond-js/uimport/packages-registry');
const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');

module.exports = async function (specifier, res) {
    if (!specifier.version) {
        res.status(404).send('Error: (404) - Package version must be set').end();
        return;
    }

    const dependencies = new DependenciesTree({pkg: specifier.pkg, version: specifier.version});
    await dependencies.process({update: false});

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
            const json = Object.assign({uptodate: vpkg.pkg.uptodate}, vpkg.pkg.toJSON());
            delete json.versions;

            /**
             * Merge the package data with the vpackage data
             */
            const output = Object.assign(json, vpkg.toJSON());

            /**
             * The flat dependencies specified in the package.json (not the tree dependencies)
             * Process the dependencies from the stored structure (the required by firestore) to a more
             * standard format
             * @type {{config?: {}}}
             */
            output.dependencies = ((dependencies) => {
                if (!dependencies) return {};

                const output = {};
                dependencies?.forEach(({key, value}) => output[key] = value);
                return {config: output};
            })(output.dependencies);

            /**
             * Process the exports from the stored structure (the required by firestore) to a more
             * standard format
             * @type {{}|{}}
             */
            output.exports = ((exports) => {
                if (!exports) return {};

                const output = {};
                output.exports?.forEach(({key, value}) => output[key] = value);
                return output;
            })(output.exports);

            return output;
        })();

        /**
         * Set the dependencies tree
         */
        json.dependencies.tree = (() => {
            const {valid, errors, object} = dependencies;
            return valid ? object : {errors};
        })();
        return json;
    })();

    res.send(content).end();
}
