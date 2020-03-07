import LicenseBuddy from './LicenseBuddy';
import yargs from 'yargs';

export default function cli(args: string[]) {
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
                        describe: 'the path to the root directory, where your "package.json" lies',
                        default: './',
                        defaultDescription: 'The current working directory'
                    })
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
                    })
                    .option('c', {
                        alias: 'ci',
                        default: false,
                        describe: 'CI mode: fail on violations',
                        type: 'boolean'
                    });
                // TODO:  discuss whether we should add option to specify rules file
            },
            checkHandler
        )

        .demandCommand(1, 'must provide a valid command')
        .help()
        .parse(args);
}

async function analyzeHandler(argv: any) {
    const lb = new LicenseBuddy(argv.rootPath, process.cwd());
    return lb.analyzeAndPrint({
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
