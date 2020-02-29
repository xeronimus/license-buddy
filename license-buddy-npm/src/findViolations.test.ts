import findViolations from './findViolations';
import {ViolationType} from './LicenseBuddy';

test('empty rules', () => {
    const result = {
        licenses: {
            FirstLicense: [{name: 'npm-module-one', repo: 'http://www.some.github.com/repository/yeah.git'}],
            SecondLicense: [{name: 'npm-module-two', repo: 'http://www.some..other.github.com/repository/superb.git'}]
        },
        dependencyCount: 2
    };

    const rules = {};

    const violations = findViolations(result, rules);

    expect(violations.length).toBe(2);

    expect(violations[0]).toEqual({
        licenseName: 'FirstLicense',
        type: ViolationType.noRule,
        dependencies: [
            {
                name: 'npm-module-one',
                repo: 'http://www.some.github.com/repository/yeah.git'
            }
        ]
    });

    expect(violations[1]).toEqual({
        licenseName: 'SecondLicense',
        type: ViolationType.noRule,
        dependencies: [
            {
                name: 'npm-module-two',
                repo: 'http://www.some..other.github.com/repository/superb.git'
            }
        ]
    });
});

test('matching rule name, no alias, not whitelisted', () => {
    const result = {
        licenses: {
            FirstLicense: [{name: 'npm-module-one', repo: 'http://www.some.github.com/repository/yeah.git'}]
        },
        dependencyCount: 1
    };

    const rules = {
        FirstLicense: {
            whitelisted: false
        }
    };

    const violations = findViolations(result, rules);

    expect(violations.length).toBe(1);

    expect(violations[0]).toEqual({
        licenseName: 'FirstLicense',
        type: ViolationType.notWhitelisted,
        dependencies: [
            {
                name: 'npm-module-one',
                repo: 'http://www.some.github.com/repository/yeah.git'
            }
        ]
    });
});

test('matching aliases, not whitelisted', () => {
    const result = {
        licenses: {
            FirstLicense: [{name: 'npm-module-one', repo: 'http://www.some.github.com/repository/yeah.git'}]
        },
        dependencyCount: 1
    };

    const rules = {
        OtherMainName: {
            aliases: ['FirstLicense'],
            whitelisted: false
        }
    };

    const violations = findViolations(result, rules);

    expect(violations.length).toBe(1);

    expect(violations[0]).toEqual({
        licenseName: 'FirstLicense',
        type: ViolationType.notWhitelisted,
        dependencies: [
            {
                name: 'npm-module-one',
                repo: 'http://www.some.github.com/repository/yeah.git'
            }
        ]
    });
});

test('matching aliasesPattern, not whitelisted', () => {
    const result = {
        licenses: {
            FirstLicense: [{name: 'npm-module-one', repo: 'http://www.some.github.com/repository/yeah.git'}]
        },
        dependencyCount: 1
    };

    const rules = {
        OtherMainName: {
            aliasesPattern: ['Fir.*stLi.*se$'],
            whitelisted: false
        }
    };

    const violations = findViolations(result, rules);

    expect(violations.length).toBe(1);

    expect(violations[0]).toEqual({
        licenseName: 'FirstLicense',
        type: ViolationType.notWhitelisted,
        dependencies: [
            {
                name: 'npm-module-one',
                repo: 'http://www.some.github.com/repository/yeah.git'
            }
        ]
    });
});
