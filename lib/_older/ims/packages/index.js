module.exports = class extends Set {
    constructor(ims) {
        super();
        ims.forEach(im => !im.external.error && this.add(im.input));
    }
}
