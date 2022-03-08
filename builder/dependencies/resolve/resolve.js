const resolve = require('resolve-package-path');

module.exports = function (pkg, application) {
    try {
        const resolved = resolve(pkg, application.path);
        if (!resolved) return {};

        // Read the package.json
        const json = require(resolved);

        // The path comes with the '/package.json' in it
        const path = require('path').resolve(resolved, '..');

        return {path, json};
    }
    catch (exc) {
        return {errors: [exc.message]};
    }
}
