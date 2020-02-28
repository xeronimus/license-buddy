import path from 'path';
import fs from 'fs';

import {init as initChecker, ModuleInfo, ModuleInfos} from 'license-checker';
import chalk from 'chalk';

/**
 *
 */
export default class LicenseBuddy {
    rootPath: string;

    constructor(rootPath: string) {
        this.rootPath = path.resolve(rootPath);
    }

    /**
     * Analyze licenses in dependencies. will resolve to a AnalysisResult object containing information about detected licenses and which dependencies use these licenses
     */
    public async analyze(options: AnalyzeOpts = {}): Promise<AnalysisResult> {
        console.log('Analyzing project in folder ' + chalk.blue(this.rootPath));

        return new Promise((resolve, reject) => {
            initChecker(
                {
                    start: this.rootPath,
                    development: options.development,
                    production: options.production
                },
                (err, moduleInfos: ModuleInfos) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(LicenseBuddy.groupByLicense(moduleInfos));
                    }
                }
            );
        });
    }

    /**
     *
     */
    public async analyzeAndPrint(options: PrintOpts = {}): Promise<void> {
        const result = await this.analyze(options);
        this.print(result, options);
    }

    /**
     *
     */
    public async check(): Promise<void> {
        const result = await this.analyze();
    }

    /**
     *
     * @param {AnalysisResult} licenseInfos
     * @param options
     */
    private print(licenseInfos: AnalysisResult, options: PrintOpts = {}): void {
        const entries = Object.entries(licenseInfos.licenses);
        const nLicenses = entries.length;

        console.log(chalk.green('License analysis done') + '\n');
        console.log(
            `${chalk.bold(nLicenses)} unique licenses found in ${
                licenseInfos.dependencyCount
            } dependencies.\n`
        );
        if (options.verbose) {
            entries.forEach((entry) => {
                console.log('\n' + chalk.bold(entry[0]));
                entry[1].forEach((dep: Dependency) => console.log(dep.name + ':' + dep.repo));
            });
        } else {
            console.log(entries.map((entry) => `${entry[0]}:${entry[1].length}`).join('\n'));
        }
    }

    /**
     * loop given packages and groups them by license
     */
    static groupByLicense(modules: ModuleInfos, options: GroupOpts = {}): AnalysisResult {
        const entries = Object.entries(modules);

        const licenseMap: LicenseMap = entries.reduce((result: LicenseMap, entry) => {
            const moduleName = entry[0];
            const moduleInfo: ModuleInfo = entry[1];

            if (Array.isArray(moduleInfo.licenses)) {
                return moduleInfo.licenses.reduce(
                    (innerResult: LicenseMap, license) =>
                        this.addDependencyToMap(
                            innerResult,
                            license,
                            moduleName,
                            moduleInfo.repository,
                            moduleInfo.licenseFile,
                            options
                        ),
                    result
                );
            } else {
                return this.addDependencyToMap(
                    result,
                    moduleInfo.licenses,
                    moduleName,
                    moduleInfo.repository,
                    moduleInfo.licenseFile,
                    options
                );
            }
        }, {});

        return {
            licenses: licenseMap,
            dependencyCount: entries.length
        };
    }

    static addDependencyToMap(
        result: LicenseMap,
        moduleLicense: string,
        moduleName: string,
        moduleRepo: string,
        licenseFile: string,
        options: GroupOpts
    ) {
        if (!result[moduleLicense]) {
            result[moduleLicense] = [];
        }

        const newPackageEntry: Dependency = {name: moduleName, repo: moduleRepo};

        if (options.includeLicenseTexts && licenseFile) {
            newPackageEntry.licenseText = fs.readFileSync(licenseFile, 'utf-8');
        }
        result[moduleLicense].push(newPackageEntry);

        return result;
    }
}

/**
 * Options struct for the groupByLicense() function
 */
interface GroupOpts {
    includeLicenseTexts?: boolean;
}

interface AnalyzeOpts {
    production?: boolean;
    development?: boolean;
}

/**
 * Options struct for the print() function
 */
interface PrintOpts extends AnalyzeOpts {
    verbose?: boolean;
}

/**
 * Information about one Dependency (direct or transitive)
 */
export interface Dependency {
    name: string;

    repo?: string;

    licenseText?: string;
}

export interface AnalysisResult {
    licenses: LicenseMap;
    dependencyCount: number;
}

interface LicenseMap {
    [licenseName: string]: Dependency[];
}
