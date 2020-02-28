import {AnalysisResult, Dependency} from './LicenseBuddy';
import chalk from 'chalk';

export class AnalysisResultPrinter {
    /**
     *
     * @param {AnalysisResult} licenseInfos
     * @param verbose
     */
    public static print(licenseInfos: AnalysisResult, verbose: boolean = false): void {
        const entries = Object.entries(licenseInfos.licenses);
        const nLicenses = entries.length;

        console.log(chalk.green('License analysis done') + '\n');
        console.log(
            `${chalk.bold(nLicenses)} unique licenses found in ${
                licenseInfos.dependencyCount
            } dependencies.\n`
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
}
