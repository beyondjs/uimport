module.exports = async function (bundle, application, paths) {
    return await require('./build')(bundle, application, paths);
}
