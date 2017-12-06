import * as electron from 'electron';
import * as fs from 'fs';

export class Files {
    static selectReadFile = (defaultPath?: string) => new Promise<string | null>((resolve) => {
        electron.remote.dialog.showOpenDialog(
            electron.remote.getCurrentWindow(),
            { defaultPath },
            files => {
                if (files && files.length) {
                    resolve(files[0]);
                } else {
                    resolve(null);
                }
            }
        );
    })

    static selectWriteFile = (defaultPath?: string) => new Promise<string | null>((resolve) => {
        electron.remote.dialog.showSaveDialog(
            electron.remote.getCurrentWindow(),
            { defaultPath },
            file => {
                if (file) {
                    resolve(file);
                } else {
                    resolve(null);
                }
            }
        );
    })

    static readFile = (fileName: string) => new Promise<string>((resolve, reject) => {
        fs.readFile(fileName, null, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    })

    static writeFile = (filePath: string, fileContent: string) => new Promise<void>((resolve, reject) => {
        fs.writeFile(filePath, fileContent, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
}
