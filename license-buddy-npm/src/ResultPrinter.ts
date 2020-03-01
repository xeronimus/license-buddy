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

        console.log(chalk.green.bold('*** License analysis done ***') + '\n');
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
            console.log(chalk.green.bold('*** No Violations found! We are safe ***') + '\n');
            return;
        }

        console.log(chalk.red.bold(`*** ${violations.length} violations found ***`) + '\n');
        violations.forEach(this.printViolation);
    }

    private static printViolation(viol: Violation): void {
        const logStrings = {
            [ViolationType.notWhitelisted]: chalk
                .rgb(255, 100, 3)
                .bold(`Use of license "${viol.licenseName}" is not whitelisted! Use is discouraged!`),

            [ViolationType.noRule]: chalk
                .rgb(255, 179, 0)
                .bold(`There is no rule for license "${viol.licenseName}"! Please discuss whether it is safe to use!`)
        };

        const matchingLogString = logStrings[viol.type];

        if (!matchingLogString) {
            console.warn('--- unknown ViolationType ' + viol.type);
        } else {
            const depsString = viol.dependencies.map((dep) => dep.name).join(', ');
            console.warn(matchingLogString + '\n' + depsString + '\n');
        }
    }
}
