import fs from 'fs';
import {Rules} from './LicenseBuddy';

export class RulesLoader {
    public static async loadRulesFromJsonFile(filePath: string): Promise<Rules> {
        const fileContent = await RulesLoader.readFilePromise(filePath);

        try {
            return <Rules>JSON.parse(fileContent);
        } catch (err) {
            throw new Error(`Cannot load Rules from  ${filePath}`);
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
