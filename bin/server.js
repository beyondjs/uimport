#!/usr/bin/env node

const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const Server = require('uimport/server');
require('colors');

const usage = '$ uimport server --port=[port number] --cwd=[working directory]';

yargs(hideBin(process.argv))
    .usage(usage)
    .command('$0', '', () => void 0, () => {
        let message = '';
        message += 'Welcome to uimport!\n'.bold;
        message += '-------------------\n\n'.bold;
        message += 'Start uimport server by executing:\n';
        message += (usage).green + '\n';
        console.info(message);
    })
    .command('server', 'Start the server', yargs => {
        yargs.positional('port', {
            type: 'number',
            describe: 'The port on which the http server will listen'
        });
        yargs.positional('cwd', {
            type: 'string',
            describe: 'The working directory'
        });
    }, argv => {
        new Server(argv.port, argv.cwd);
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    })
    .parse();
