module.exports = new class {
    #cache = new Map();

    get(im, application) {
        const cache = this.#cache;

        const key = `${im.pkg}//${application.id}`;
        if (cache.has(key)) return cache.get(key);

        const pkg = new (require('./package'))(im, application);
        cache.set(key, pkg);
        return pkg;
    }
}
