module.exports = function (bundle, inputs, application) {
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
