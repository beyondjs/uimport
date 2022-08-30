module.exports = function (mode, code, dependencies, exports, reexports, versions) {
    if (mode === 'esm') return require('./esm')(code, dependencies, versions, exports, reexports);
    if (mode === 'sjs') return require('./sjs')(code, dependencies, versions, exports, reexports);
    if (mode === 'amd') return require('./amd')(code, dependencies, versions, exports, reexports);
}