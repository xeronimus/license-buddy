import {ModuleInfo, ModuleInfos} from 'license-checker';
import {AnalysisResult, Dependency, LicenseMap} from './LicenseBuddy';
import fs from 'fs';

/**
 * loop given modules and groups them by license
 */
export default function groupByLicense(modules: ModuleInfos, includeLicenseTexts: boolean = false): AnalysisResult {
    const entries = Object.entries(modules);

    const licenseMap: LicenseMap = entries.reduce((result: LicenseMap, entry) => {
        const moduleName = entry[0];
        const moduleInfo: ModuleInfo = entry[1];

        if (Array.isArray(moduleInfo.licenses)) {
            return addDependenciesToMap(
                result,
                moduleInfo.licenses,
                moduleName,
                moduleInfo.repository,
                moduleInfo.licenseFile,
                includeLicenseTexts
            );
        } else {
            return addDependencyToMap(
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

function addDependenciesToMap(
    result: LicenseMap,
    moduleLicenses: string[],
    moduleName: string,
    moduleRepo: string,
    licenseFile: string,
    includeLicenseTexts: boolean
): LicenseMap {
    return moduleLicenses.reduce(
        (innerResult: LicenseMap, license) =>
            addDependencyToMap(innerResult, license, moduleName, moduleRepo, licenseFile, includeLicenseTexts),
        result
    );
}

function addDependencyToMap(
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
