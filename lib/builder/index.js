module.exports = class {
    #building;
    #specs;

    constructor(pkg, version, subpath, specs) {
        if (!specs?.registry.cache || !specs.downloader.cache || !specs.builds.cache) {
            throw new Error('Invalid parameters');
        }

        subpath = (() => {
            subpath = subpath === './' ? '.' : subpath;
            subpath = subpath ? subpath : '.';
            subpath = subpath === '.' || subpath.startsWith('./') ? subpath : `./${subpath}`;
            return subpath;
        })();

        const vspecifier = `${pkg}@${version}` + (subpath === '.' ? '' : subpath.slice(1));
        const namespace = `uimport:${pkg}@${version}`;

        this.#building = {pkg, version, subpath, namespace, vspecifier};
        this.#specs = specs;
    }

    async process() {
        const cache = new (require('./cache'))(this.#building, this.#specs.builds.cache);
        const cached = await cache.load();
        if (cached) return cached;

        const prepared = await require('./prepare')(this.#building, this.#specs);
        if (prepared.errors?.length) return {errors: prepared.errors};
        const {tree, downloads} = prepared;

        const done = async (data) => {
            await cache.save(data);
            return data;
        }

        const processed = await require('./build')(this.#building, tree, downloads)
        if (processed.errors?.length) return await done({errors: processed.errors});

        const wrapped = require('./wrap')(processed.content);
        return await done({content: wrapped.content});
    }
}
