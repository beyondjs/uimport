const store = require('#store');

exports.initialise = function (specs) {
    store.initialise(specs?.store);
}
