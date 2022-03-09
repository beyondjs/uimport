module.exports = new class {
    #cache = new Map();

    get(pkg, paths) {
        const cache = this.#cache;

        const key = `${pkg}//${paths.cwd}`;
        if (cache.has(key)) return cache.get(key);

        pkg = new (require('./package'))(pkg, paths);
        cache.set(key, pkg);
        return pkg;
    }
}
