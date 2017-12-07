import * as electron from 'electron';

export class Dialogs {
    static openFile = (defaultPath?: string) => new Promise<string | null>((resolve) => {
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

    static saveFile = (defaultPath?: string) => new Promise<string | null>((resolve) => {
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
}
