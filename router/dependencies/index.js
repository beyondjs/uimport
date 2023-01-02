const {DependenciesTree} = require('@beyond-js/uimport/dependencies-tree');
const register = require('./register');
const get = require('./get');
const browser = require('./browser');

module.exports = async function (route, res) {
    if (route.action === 'register') {
        await register(route, res);
        return;
    }

    const {dependencies, error} = (() => {
        if (route.vdir === 'app.dependencies') {
            const {application} = route;
            const dependencies = new DependenciesTree({application});
            return {dependencies};
        }
        else {
            const {pkg, version, subpath} = route.specifier;
            if (subpath !== '.') {
                const error = `Invalid url package subpath "${subpath}" should not be specified`;
                return {error};
            }

            const dependencies = new DependenciesTree({pkg, version});
            return {dependencies};
        }
    })();
    if (error) {
        res.status(404).send(error).end();
        return;
    }

    if (route.action === 'get') {
        await get(dependencies, res);
        return;
    }

    const platforms = ['browser'];
    if (!platforms.includes(route.options.platform)) {
        res.status(404).send('Please specify a valid platform').end();
    }
    else {
        await browser(dependencies, res);
    }
}