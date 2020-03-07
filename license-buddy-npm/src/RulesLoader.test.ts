import path from 'path';

import RulesLoader from './RulesLoader';

test('loadRules from packageJson', async () => {
    const rules = await RulesLoader.loadRules(path.resolve(__dirname, '../'));

    expect(rules).toBeDefined();
    expect(rules['MIT']).toBeDefined();
});
