import * as electron from 'electron';

import { OpenDialogOptions } from 'electron';

export class Dialogs {
    static openFile = (options: OpenDialogOptions = {}) => new Promise<string | null>((resolve) => {
        electron.remote.dialog.showOpenDialog(
            electron.remote.getCurrentWindow(),
            options,
            files => {
                if (files && files.length) {
                    resolve(files[0]);
                } else {
                    resolve(null);
                }
            }
        );
    })

    static saveFile = (options: OpenDialogOptions = {}) => new Promise<string | null>((resolve) => {
        electron.remote.dialog.showSaveDialog(
            electron.remote.getCurrentWindow(),
            options,
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
