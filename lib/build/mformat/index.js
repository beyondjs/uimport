module.exports = function (mode, code, dependencies, exports, reexports) {
    if (mode === 'esm') return require('./esm')(code, dependencies, exports, reexports);
    if (mode === 'sjs') return require('./sjs')(code, dependencies, exports, reexports);
    if (mode === 'amd') return require('./amd')(code, dependencies, exports, reexports);
}
