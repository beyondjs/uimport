module.exports = class {
    #value;
    get value() {
        return this.#value;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #version;
    get version() {
        return this.#version;
    }

    #vpkg;
    get vpkg() {
        return this.#vpkg;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    constructor({value, pkg, version}) {
        if (value) {
            if (!value.startsWith('beyond:')) {
                this.#error = `Value should start with string "beyond:"`;
                return;
            }

            this.#value = value;
            const vpkg = value.slice('beyond:'.length);

            const split = vpkg.split('/');
            const scope = split[0].startsWith('@') ? split.shift() : void 0;
            const [name, version] = split.shift().split('@');

            this.#pkg = scope ? `${scope}/${name}` : name;
            this.#version = version;
            this.#vpkg = `${this.#pkg}@${this.#version}`;
        }
        else if (pkg && version) {
            this.#pkg = pkg;
            this.#version = version;
            this.#vpkg = `${this.#pkg}@${this.#version}`;
            this.#value = `beyond:${this.#vpkg}`;
        }
        else {
            throw new Error('Invalid parameters');
        }
    }
}
