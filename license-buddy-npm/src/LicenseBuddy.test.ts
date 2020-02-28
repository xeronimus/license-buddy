import LicenseBuddy, {AnalysisResult, Dependency} from './LicenseBuddy';

const searchForDependency = (result: AnalysisResult, dependencyName: string) =>
    Object.values(result.licenses).some((infos: Dependency[]) =>
        infos.some((info: Dependency) => info.name.includes(dependencyName))
    );

test('analyze with license texts', async () => {
    // this option is currently not exposed in the cli...

    const lb = new LicenseBuddy('./');
    const result: AnalysisResult = await lb.analyze({
        includeLicenseText: true
    });

    expect(result).toBeDefined();
    expect(Object.values(result.licenses)[0][0].licenseText).toBeDefined();
});

test('analyze development', async () => {
    const lb = new LicenseBuddy('./');
    const result: AnalysisResult = await lb.analyze({
        development: true
    });

    expect(result).toBeDefined();

    // @types/yargs is one of our prod dependencies, should not be included in result...
    // this test will break, if one of the devDependencies includes this (transitive)
    expect(searchForDependency(result, '@types/yargs@')).toBe(false);

    expect(searchForDependency(result, 'prettier@')).toBe(true);
});

test('analyze production', async () => {
    const lb = new LicenseBuddy('./');
    const result: AnalysisResult = await lb.analyze({
        production: true
    });

    expect(result).toBeDefined();

    // jest is one of our dev dependencies, should not be included in result...
    // this test will break, if one of the prod dependencies includes this (transitive)
    expect(searchForDependency(result, 'jest@')).toBe(false);
});

test('analyze and print', async () => {
    const lb = new LicenseBuddy('./');
    await lb.analyzeAndPrint();
});
