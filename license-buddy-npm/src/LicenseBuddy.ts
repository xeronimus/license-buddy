import path from 'path';
import chalk from 'chalk';

import {init as initChecker, ModuleInfos} from 'license-checker';
import ResultPrinter from './ResultPrinter';
import RulesLoader from './RulesLoader';
import groupByLicense from './groupByLicense';
import findViolations from './findViolations';

/**
 *
 */
export default class LicenseBuddy {
    rootPath: string;
    cwd: string;

    constructor(rootPath: string, cwd: string) {
        this.rootPath = path.resolve(rootPath);
        this.cwd = cwd;
    }

    /**
     * Analyzes licenses in dependencies. will resolve to a AnalysisResult object containing information about detected licenses and which dependencies use these licenses
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
                        resolve(groupByLicense(moduleInfos, options.includeLicenseText));
                    }
                }
            );
        });
    }

    /**
     * Analyzes licenses in dependencies. Prints result (information of all used licenses)
     */
    public async list(options: AnalyzeOpts = {}): Promise<void> {
        const result = await this.analyze(options);
        ResultPrinter.printAnalysisResult(result, options.verbose);
    }

    /**
     * Analyzes licenses in dependencies. Print licenses that are in violation of rules (recommendations)
     */
    public async analyzeAndCheck(): Promise<Violation[]> {
        const result = await this.analyze();

        const rules = await RulesLoader.loadRules(this.cwd);
        const violations = findViolations(result, rules);

        ResultPrinter.printViolations(violations);

        return violations;
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

export interface LicenseMap {
    [licenseName: string]: Dependency[];
}

export interface Rules {
    [licenseName: string]: Rule;
}

export interface Rule {
    aliases?: string[];
    aliasesPattern?: string[];
    whitelisted: boolean;
}

export interface Violation {
    licenseName: string;
    type: ViolationType;
    dependencies: Dependency[];
}

export enum ViolationType {
    noRule = 'NO_RULE',
    notWhitelisted = 'NOT_WHITELISTED'
}
