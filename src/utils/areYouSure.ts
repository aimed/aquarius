import * as electron from 'electron';

export function areYouSure(): boolean {
    const window = electron.remote.getCurrentWindow();
    const choise = electron.remote.dialog.showMessageBox(window, {
        message: 'Changes will be lost, are you sure?',
        type: 'question',
        buttons: ['no', 'yes']
    });
    return choise === 1; // yes
}
