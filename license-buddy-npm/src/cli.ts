#!/usr/bin/env node

import LicenseBuddy from './LicenseBuddy';
import yargs from 'yargs';

yargs
    .scriptName('license-buddy-npm')
    .usage('Usage: $0 <cmd> [args]')
    .command(
        'analyze [rootPath]',
        'Analyze licenses in your npm dependency tree',
        (yargs) => {
            yargs
                .positional('rootPath', {
                    type: 'string',
                    describe: 'the path to the root directory, where your "package.json" lies'
                })
                .demand('rootPath')
                .option('v', {
                    alias: 'verbose',
                    default: false,
                    describe: 'Print out more detailed information',
                    type: 'boolean'
                })
                .option('p', {
                    alias: 'production',
                    default: false,
                    describe: 'Only include production dependencies',
                    type: 'boolean'
                })
                .option('d', {
                    alias: 'development',
                    default: false,
                    describe: 'Only include development dependencies',
                    type: 'boolean'
                });
        },
        analyzeHandler
    )

    .command(
        'check [rootPath]',
        'Check licenses in your npm dependency tree against recommendations. Warn if problematic license is used.',
        (yargs) => {
            yargs
                .positional('rootPath', {
                    type: 'string',
                    describe: 'the path to the root directory, where your "package.json" lies'
                })
                .demand('rootPath')
                .option('p', {
                    alias: 'production',
                    default: false,
                    describe: 'Only include production dependencies',
                    type: 'boolean'
                })
                .option('d', {
                    alias: 'development',
                    default: false,
                    describe: 'Only include development dependencies',
                    type: 'boolean'
                });

            // TODO:  add option to fail on violations
            // TODO:  discuss whether we should add option to specify rules file
        },
        checkHandler
    )

    .demandCommand(1, 'must provide a valid command')
    .help().argv;

async function analyzeHandler(argv: any) {
    const lb = new LicenseBuddy(argv.rootPath);
    return lb.analyzeAndPrint({
        verbose: argv.verbose,
        production: argv.production,
        development: argv.development
    });
}

async function checkHandler(argv: any) {
    const lb = new LicenseBuddy(argv.rootPath);
    return lb.analyzeAndCheck();
}
