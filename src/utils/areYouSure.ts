import * as electron from 'electron';

export async function areYouSure(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const window = electron.remote.getCurrentWindow();
        electron.remote.dialog.showMessageBox(window, {
            message: 'Changes will be lost, are you sure?',
            type: 'question',
            buttons: ['no', 'yes']
        }, (response: number) => {
            resolve(response === 1); // Index of the yes button
        });
    });
}