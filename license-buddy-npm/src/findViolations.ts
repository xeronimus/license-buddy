import {AnalysisResult, Dependency, Rule, Rules, Violation, ViolationType} from './LicenseBuddy';

/**
 * checks for every license in given analysisResult whether it is in violation of the rules.
 *
 * @param result
 * @param rules
 */
export default function findViolations(result: AnalysisResult, rules: Rules): Violation[] {
    const licenseEntries = Object.entries(result.licenses);

    return licenseEntries.reduce((res: Violation[], licenseEntry) => {
        const licenseName: string = licenseEntry[0];
        const licenseDeps: Dependency[] = licenseEntry[1];

        const rule = findMatchingRuleForLicense(licenseName, rules);

        if (!rule) {
            res.push({
                licenseName,
                type: ViolationType.noRule,
                dependencies: licenseDeps
            });
        } else if (!rule.whitelisted) {
            res.push({
                licenseName,
                type: ViolationType.notWhitelisted,
                dependencies: licenseDeps
            });
        }

        return res;
    }, []);
}

function findMatchingRuleForLicense(licenseName: string, rules: Rules): Rule {
    if (rules[licenseName]) {
        return rules[licenseName];
    }

    // check aliases
    const matchingAliases = Object.values(rules).find(
        (rule: Rule) => rule.aliases && rule.aliases.includes(licenseName)
    );
    if (matchingAliases) {
        return matchingAliases;
    }

    // check aliasesPatterns
    const matchingAliasesPattern = Object.values(rules).find(
        (rule: Rule) =>
            rule.aliasesPattern && rule.aliasesPattern.some((pattern) => new RegExp(pattern).test(licenseName))
    );
    if (matchingAliasesPattern) {
        return matchingAliasesPattern;
    }

    return undefined;
}
