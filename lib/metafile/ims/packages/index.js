module.exports = new class {
    #cache = new Map();

    get(im, absWorkingDir) {
        const cache = this.#cache;

        const key = `${im.pkg}//${absWorkingDir}`;
        if (cache.has(key)) return cache.get(key);

        const pkg = new (require('./package'))(im, absWorkingDir);
        cache.set(key, pkg);
        return pkg;
    }
}
