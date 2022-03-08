/**
 * The root package of an internal module
 */
module.exports = class {
    constructor(im, ims, externals) {
        // console.log('looking the root package of', im.path);
        // im.consumers.forEach(consumer => console.log('\t - consumer:', consumer.path));
        return;

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
    }
}
