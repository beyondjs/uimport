const uimport = require('@beyond-js/uimport');
uimport.initialise();

module.exports = [
    require('./serve'),
    require('./install')
]
