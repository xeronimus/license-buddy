import {ModuleInfos} from 'license-checker';
import groupByLicense from './groupByLicense';

test('two dependencies, same licenses', () => {
    const modules: ModuleInfos = {
        'npm-module-one': {
            repository: 'http://www.some.github.com/repository/yeah.git',
            licenses: 'FirstLicense'
        },
        'npm-module-two': {
            repository: 'http://www.some..other.github.com/repository/superb.git',
            licenses: 'FirstLicense'
        }
    };

    const result = groupByLicense(modules);

    expect(result).toBeDefined();

    expect(result).toEqual({
        licenses: {
            FirstLicense: [
                {name: 'npm-module-one', repo: 'http://www.some.github.com/repository/yeah.git'},
                {name: 'npm-module-two', repo: 'http://www.some..other.github.com/repository/superb.git'}
            ]
        },
        dependencyCount: 2
    });
});

test('two dependencies, two different licenses', () => {
    const modules: ModuleInfos = {
        'npm-module-one': {
            repository: 'http://www.some.github.com/repository/yeah.git',
            licenses: 'FirstLicense'
        },
        'npm-module-two': {
            repository: 'http://www.some..other.github.com/repository/superb.git',
            licenses: 'SecondLicense'
        }
    };

    const result = groupByLicense(modules);

    expect(result).toBeDefined();

    expect(result).toEqual({
        licenses: {
            FirstLicense: [{name: 'npm-module-one', repo: 'http://www.some.github.com/repository/yeah.git'}],
            SecondLicense: [{name: 'npm-module-two', repo: 'http://www.some..other.github.com/repository/superb.git'}]
        },
        dependencyCount: 2
    });
});

test('multiple licenses in one dependency', () => {
    const modules: ModuleInfos = {
        'npm-module-one': {
            repository: 'http://www.some.github.com/repository/yeah.git',
            licenses: ['Multi-License-one', 'Multi-License-two']
        }
    };

    const result = groupByLicense(modules);

    expect(result).toBeDefined();

    expect(result).toEqual({
        licenses: {
            'Multi-License-one': [{name: 'npm-module-one', repo: 'http://www.some.github.com/repository/yeah.git'}],
            'Multi-License-two': [{name: 'npm-module-one', repo: 'http://www.some.github.com/repository/yeah.git'}]
        },
        dependencyCount: 1
    });
});
