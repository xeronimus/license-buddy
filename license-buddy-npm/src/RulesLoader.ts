import path from 'path';
import fs from 'fs';
import {Rules} from './LicenseBuddy';

export default class RulesLoader {
    public static async loadRules(cwd: string): Promise<Rules> {
        const config = await this.loadFromPackageJson(cwd);

        if (config) {
            return <Rules>config;
        } else {
            throw new Error(`Cannot load Rules from  ${cwd}`);
        }
    }

    private static async loadFromPackageJson(cwd: string): Promise<unknown> {
        try {
            const pkgFileContent = await this.readFilePromise(path.join(cwd, 'package.json'));
            const pkg = JSON.parse(pkgFileContent);
            return pkg.licenseBuddy || null;
        } catch (err) {
            return null;
        }
    }

    private static readFilePromise(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf-8', (err, fileContent) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(fileContent);
                }
            });
        });
    }
}
