import {PositionalOptions, Options} from 'yargs';
import yargs from 'yargs';

import LicenseBuddy from './LicenseBuddy';

const YCFG_POS_ROOT_PATH: PositionalOptions = {
    type: 'string',
    describe: 'the path to the root directory, where your "package.json" lies',
    default: './'
};
const YCFG_OPT_PROD: Options = {
    alias: 'production',
    default: false,
    describe: 'Only include production dependencies',
    type: 'boolean'
};
const YCFG_OPT_DEV: Options = {
    alias: 'development',
    default: false,
    describe: 'Only include development dependencies',
    type: 'boolean'
};
const YCFG_OPT_VERB: Options = {
    alias: 'verbose',
    default: false,
    describe: 'Print out more detailed information',
    type: 'boolean'
};
const YCFG_OPT_CI: Options = {
    alias: 'ci',
    default: false,
    describe: 'CI mode: fail on violations',
    type: 'boolean'
};

export default function cli(args: string[]) {
    yargs
        .scriptName('license-buddy-npm')
        .usage('Usage: $0 <cmd> [args]')
        .command(
            'list [rootPath]',
            'Lists licenses in your npm dependency tree',
            (yargs) => {
                yargs
                    .positional('rootPath', YCFG_POS_ROOT_PATH)
                    .option('v', YCFG_OPT_VERB)
                    .option('p', YCFG_OPT_PROD)
                    .option('d', YCFG_OPT_DEV);
            },
            listHandler
        )

        .command(
            'check [rootPath]',
            'Check licenses in your npm dependency tree against configured whitelist. Warn if problematic license is used.',
            (yargs) => {
                yargs
                    .positional('rootPath', YCFG_POS_ROOT_PATH)
                    .option('p', YCFG_OPT_PROD)
                    .option('d', YCFG_OPT_DEV)
                    .option('c', YCFG_OPT_CI);
            },
            checkHandler
        )

        .demandCommand(1, 'must provide a valid command')
        .help()
        .parse(args);
}

async function listHandler(argv: any) {
    const lb = new LicenseBuddy(argv.rootPath, process.cwd());
    return lb.list({
        verbose: argv.verbose,
        production: argv.production,
        development: argv.development
    });
}

async function checkHandler(argv: any) {
    const lb = new LicenseBuddy(argv.rootPath, process.cwd());
    const violations = await lb.analyzeAndCheck();

    if (argv.ci && violations.length > 0) {
        console.error(`Violations found & CI flag is set: Exiting with code 1`);
        process.exit(1);
    }
}
