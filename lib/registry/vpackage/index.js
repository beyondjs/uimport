module.exports = class {
    #json;
    get json() {
        return this.#json;
    }

    get scope() {
        return this.#json.scope;
    }

    get name() {
        return this.#json.name;
    }

    get version() {
        return this.#json.version;
    }

    get vspecifier() {
        const {name, version} = this;
        return `${name}@${version}`;
    }

    get description() {
        return this.#json.description;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #exports;
    get exports() {
        return this.#exports;
    }

    #browser;
    get browser() {
        return this.#browser;
    }

    constructor(json) {
        this.#json = json;
        this.#exports = new (require('./exports'))(json);
        this.#browser = (() => {
            let {browser} = json;
            browser = typeof browser === 'string' ? {'./': browser} : browser;
            browser = typeof browser === 'object' ? browser : {};
            return new Map(Object.entries(browser));
        })();
        this.#dependencies = new (require('./dependencies'))(json);
    }
}
