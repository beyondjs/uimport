module.exports = class extends Map {
    constructor(metafile) {
        super();
        metafile.ims.forEach(im => !im.external.error && this.set(im.path, im));
    }
}
