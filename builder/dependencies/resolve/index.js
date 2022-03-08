const cache = new Map();

module.exports = function (pkg, subpath, application) {
    const {errors, path, json} = require('./resolve')(pkg, application);
    if (errors) return {errors};

    const key = `${pkg}//${application.id}`;
    if (cache.has(key)) return cache.get(key);

    const done = (response) => {
        cache.set(key, response);
        return response;
    }

    if (!path) return done({errors: [`Package "${pkg}" not found`]});
    if (!subpath) return done({path, json});

    const {exports} = json;
    if (!exports?.hasOwnProperty(`./${subpath}`)) {
        return done({errors: [`External does not exports subpath "./${subpath}"`]});
    }

    return done({path, json: json.exports[`./${subpath}`]});
}
