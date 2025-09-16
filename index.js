const Server = require('uimport/server');
const { join } = require('path');

let message = '';
message += 'Welcome to uimport!\n'.bold;
message += '-------------------\n\n'.bold;
message += 'Starting uimport server:\n';
console.info(message);

const cwd = join(__dirname, 'tests');
new Server(8080, cwd);
