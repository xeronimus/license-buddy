import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

import {init as initChecker, ModuleInfo, ModuleInfos} from 'license-checker';
import {AnalysisResultPrinter} from './AnalysisResultPrinter';

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
                        resolve(
                            LicenseBuddy.groupByLicense(moduleInfos, options.includeLicenseText)
                        );
                    }
                }
            );
        });
    }

    /**
     *
     */
    public async analyzeAndPrint(options: AnalyzeOpts = {}): Promise<void> {
        const result = await this.analyze(options);
        AnalysisResultPrinter.print(result, options.verbose);
    }

    /**
     *
     */
    public async check(): Promise<void> {
        const result = await this.analyze();
    }

    /**
     * loop given packages and groups them by license
     */
    static groupByLicense(
        modules: ModuleInfos,
        includeLicenseTexts: boolean = false
    ): AnalysisResult {
        const entries = Object.entries(modules);

        const licenseMap: LicenseMap = entries.reduce((result: LicenseMap, entry) => {
            const moduleName = entry[0];
            const moduleInfo: ModuleInfo = entry[1];

            if (Array.isArray(moduleInfo.licenses)) {
                return this.addDependenciesToMap(
                    result,
                    moduleInfo.licenses,
                    moduleName,
                    moduleInfo.repository,
                    moduleInfo.licenseFile,
                    includeLicenseTexts
                );
            } else {
                return this.addDependencyToMap(
                    result,
                    moduleInfo.licenses,
                    moduleName,
                    moduleInfo.repository,
                    moduleInfo.licenseFile,
                    includeLicenseTexts
                );
            }
        }, {});

        return {
            licenses: licenseMap,
            dependencyCount: entries.length
        };
    }

    static addDependenciesToMap(
        result: LicenseMap,
        moduleLicenses: string[],
        moduleName: string,
        moduleRepo: string,
        licenseFile: string,
        includeLicenseTexts: boolean
    ): LicenseMap {
        return moduleLicenses.reduce(
            (innerResult: LicenseMap, license) =>
                this.addDependencyToMap(
                    innerResult,
                    license,
                    moduleName,
                    moduleRepo,
                    licenseFile,
                    includeLicenseTexts
                ),
            result
        );
    }

    static addDependencyToMap(
        result: LicenseMap,
        moduleLicense: string,
        moduleName: string,
        moduleRepo: string,
        licenseFile: string,
        includeLicenseTexts: boolean
    ): LicenseMap {
        if (!result[moduleLicense]) {
            result[moduleLicense] = [];
        }

        const newPackageEntry: Dependency = {name: moduleName, repo: moduleRepo};

        if (includeLicenseTexts && licenseFile) {
            newPackageEntry.licenseText = fs.readFileSync(licenseFile, 'utf-8');
        }
        result[moduleLicense].push(newPackageEntry);

        return result;
    }
}

export interface AnalyzeOpts {
    production?: boolean;
    development?: boolean;
    verbose?: boolean;
    includeLicenseText?: boolean;
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
