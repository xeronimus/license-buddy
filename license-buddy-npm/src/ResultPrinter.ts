import {AnalysisResult, Dependency, Violation, ViolationType} from './LicenseBuddy';
import chalk from 'chalk';

export class ResultPrinter {
    /**
     *
     * @param {AnalysisResult} licenseInfos
     * @param verbose
     */
    public static printAnalysisResult(licenseInfos: AnalysisResult, verbose: boolean = false): void {
        const entries = Object.entries(licenseInfos.licenses);
        const nLicenses = entries.length;

        console.log(chalk.green('License analysis done') + '\n');
        console.log(
            `${chalk.bold(nLicenses)} unique licenses found in ${licenseInfos.dependencyCount} dependencies.\n`
        );
        if (verbose) {
            entries.forEach((entry) => {
                console.log('\n' + chalk.bold(entry[0]));
                entry[1].forEach((dep: Dependency) => console.log(dep.name + ':' + dep.repo));
            });
        } else {
            console.log(entries.map((entry) => `${entry[0]}:${entry[1].length}`).join('\n'));
        }
    }

    public static printViolations(violations: Violation[]): void {
        if (violations.length < 1) {
            console.log(chalk.green('No Violations found! We are safe :-)'));
            return;
        }

        violations.forEach(this.printViolation);
    }

    private static printViolation(viol: Violation): void {
        const depsString = viol.dependencies.map((dep) => dep.name).join(', ');

        const logStrings = {
            [ViolationType.notWhitelisted]:
                chalk
                    .rgb(255, 100, 3)
                    .bold(`Use of license "${viol.licenseName}" is not whitelisted! Use is discouraged!\n`) +
                depsString,

            [ViolationType.noRule]:
                chalk
                    .rgb(250, 128, 0)
                    .bold(
                        `There is no rule for license "${viol.licenseName}"! Please discuss whether it is safe to use!\n`
                    ) + depsString
        };

        const matchingLogString = logStrings[viol.type];

        if (!matchingLogString) {
            console.warn('--- unknown ViolationType ' + viol.type);
        }

        console.warn(matchingLogString);
    }
}
