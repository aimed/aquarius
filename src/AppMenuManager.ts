import { MenuItemConstructorOptions, remote } from 'electron';

const { Menu } = remote;

export interface MenuDelegate {
    onSave: () => any;
    onOpen: () => any;
    onExport: () => any;
    onNew: () => any;
}

const EmptyDelegate: MenuDelegate = {
    // tslint:disable-next-line:no-empty
    onSave() {},
    // tslint:disable-next-line:no-empty
    onOpen() {},
    // tslint:disable-next-line:no-empty
    onExport() {},
    // tslint:disable-next-line:no-empty
    onNew() {}
};

export class AppMenuManager implements MenuDelegate {
    private static _instance: AppMenuManager | null;

    static get instance(): AppMenuManager {
        // Lazy initiate to ensure that this is called after the app is ready.
        if (!AppMenuManager._instance) {
            AppMenuManager._instance = new AppMenuManager();
        }
        return AppMenuManager._instance;
    }

    delegate: MenuDelegate = EmptyDelegate;

    onNew: () => any = () => {
        this.delegate.onNew();
    }

    onSave: () => any = () => {
        this.delegate.onSave();
    }

    onOpen: () => any = () => {
        this.delegate.onOpen();
    }

    onExport: () => any = () => {
        this.delegate.onExport();
    }

    setDelegate(delegate: MenuDelegate | null) {
        this.delegate = delegate || EmptyDelegate;
    }

    private constructor() {
        const template: MenuItemConstructorOptions[] = [
            {
                label: 'File',
                submenu: [
                    { role: 'new', click: this.onNew, label: 'New', accelerator: 'CmdOrCtrl+n' },
                    { role: 'open', click: this.onOpen, label: 'Open', accelerator: 'CmdOrCtrl+o' },
                    { role: 'save', click: this.onSave, label: 'Save',  accelerator: 'CmdOrCtrl+s' },
                    { role: 'export', click: this.onExport, label: 'Export',  accelerator: 'CmdOrCtrl+e' },
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }
}