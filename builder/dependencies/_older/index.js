module.exports = function (bundle, inputs, application) {
    const externals = new Map();
    const dependencies = new Map();
    const root = `node_modules/${bundle}/`;

    [...Object.keys(inputs)].forEach(input => {
        if (!input.includes('node_modules/') || input.includes(root)) return;
        const {errors, errorCode, solved} = require('../dependencies/find')(input, application);

        // Who imports the input dependency
        const importers = (() => {
            const importers = new Set();
            Object.entries(inputs).forEach(([importer, {imports}]) => {
                imports = imports.map(({path}) => path);
                imports.includes(input) && importers.add(importer);
            });
            return importers;
        })();

        const relative = input.split('/node_modules/')[0];
        dependencies.set(input, {errors, errorCode, input, solved, importers});

        // Add the external. If no errors were found, it means that it is an external bundle
        if (!errors?.length) {
            const exclude = `${relative}/node_modules/${solved}/*`;
            !errors?.length && externals.set(solved, exclude);
        }
    });

    // Find the root package of the internal dependencies
    dependencies.forEach(dependency => {
        if (!dependency.errors?.length) {
            // If no errors were find, it means that the dependency is an external package already being solved
            return dependency;
        }

        // Recursively find the root bundle of the current dependency
        const recursivelyLookForRoot = (parent) => {
            if (!parent.errors?.length) return parent;

            // To access the root, any of the importers can be taken
            const grandpa = [...parent.importers][0];
            if (!dependencies.has(grandpa)) {
                // For some unknown reason, the parent of the actual parent cannot be found
                return {
                    errorCode: 3,
                    errors: [`Parent importer of "${parent.input}" not found on dependency "${dependency.input}"`]
                };
            }

            return recursivelyLookForRoot(grandpa, dependencies.get(grandpa));
        }

        dependencies.get(dependency.input).root = recursivelyLookForRoot(dependency);
    });

    console.log('DEPENDENCIES:', dependencies);

    // Look for errors in dependencies
    const errors = [];
    dependencies.forEach((data, dependency) => {
        // errorCode = 2 means that the package exists, but its subpath was not found
        // This is the case of "object_assign" or "lodash"
        reference.errorCode === 1 && errors.push(`Dependency "${dependency}" cannot be solved`);
    });
    console.log(externals, dependencies);
    return errors.length ? {errors} : {externals, dependencies};
}
