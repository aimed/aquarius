/**
 * At this point we import ace supporting files.
 * We use the markdown mode and the github theme.
 * The language tools are needed for autocomplete.
 * We need to import this before we import ace itself.
 */
import 'brace';
import 'brace/mode/text';
import 'brace/theme/github';
import 'brace/ext/language_tools';

import * as React from 'react';
import * as electron from 'electron';

import AceEditor, { Annotation } from 'react-ace';
import { AppMenuManager, MenuDelegate } from './utils/AppMenuManager';

import { Button } from './Button/Button';
import { Dialogs } from './Dialogs';
import { Mermaid } from './Mermaid/Mermaid';
import { PdfExporter } from './PdfExporter';
import { SubmitButton } from './Button/SubmitButtons';
import { Theme } from 'mermaid';
import { areYouSure } from './utils/areYouSure';
import { fs } from 'mz';

const Store = require('electron-store'); // tslint:disable-line
const store = new Store();

export interface AppState {
  mermaid?: string;
  mermaidUnchanged?: string;
  mermaidFilePath?: string | null;
  errors?: Annotation[];
  theme?: Theme;
}

export class App extends React.Component<{}, AppState> implements MenuDelegate {
  state: AppState = {
    mermaid: '',
    mermaidUnchanged: '',
    mermaidFilePath: store.get('lastMermaidFilePath', null),
    theme: store.get('theme', 'default')
  };

  mermaidRef: SVGElement | null = null;

  handleClose = (event: electron.Event) => {
    if (this.fileChanged && !areYouSure()) {
      event.preventDefault();
    }
  }

  componentWillMount() {
    electron.remote.getCurrentWindow().addListener('close', this.handleClose);
    // electron.remote.app.addListener('before-quit', this.handleClose);

    if (this.state.mermaidFilePath) {
      this.onOpen(this.state.mermaidFilePath);
    }

    AppMenuManager.instance.setDelegate(this);
  }

  componentWillUnmount() {
    electron.remote.getCurrentWindow().removeListener('close', this.handleClose);
    // electron.remote.app.removeListener('before-quit', this.handleClose);
    AppMenuManager.instance.setDelegate(null);
  }

  get isExistingFile(): boolean {
    return !!this.state.mermaidFilePath;
  }

  get fileChanged(): boolean {
    return this.state.mermaid !== this.state.mermaidUnchanged;
  }

  onMermaidError = (row: number, column: number, message: string) => {
    this.setState({ errors: [{ row: row - 1, column, type: 'error', text: message }] });
  }

  onMermaidSuccess = () => {
    this.setState({ errors: undefined });
  }

  setTheme = (theme: Theme) => {
    this.setState({ theme });
  }

  componentWillUpdate(_nextProps: {}, nextState: AppState) {
    if (nextState.mermaidFilePath !== this.state.mermaidFilePath) {
      store.set('lastMermaidFilePath', nextState.mermaidFilePath);
    }

    if (nextState.theme !== this.state.theme) {
      store.set('theme', nextState.theme as string);
    }
  }

  getFileName(state: AppState = this.state): string {
    const hasChanged = state.mermaid !== state.mermaidUnchanged;
    const title = (state.mermaidFilePath || '') + (hasChanged ? ' (unsaved)' : '');
    return title;
  }

  onOpen = async (fileName?: string | null) => {
    if (this.fileChanged && !areYouSure()) {
      return;
    }

    if (!fileName) {
      fileName = await Dialogs.openFile();
    }

    if (!fileName) {
      return;
    }

    const mermaid = (await fs.readFile(fileName)).toString();

    this.setState({
      mermaidFilePath: fileName,
      mermaid,
      mermaidUnchanged: mermaid
    });
  }

  onSave = async () => {
    const { mermaidFilePath, mermaid } = this.state;
    let saveFilePath: string | null | undefined = mermaidFilePath;

    if (!saveFilePath) {
      saveFilePath = await Dialogs.saveFile();

      if (saveFilePath) {
        this.setState({ mermaidFilePath: saveFilePath });
      }
    }

    if (saveFilePath) {
      await fs.writeFile(saveFilePath, mermaid + '');
    }

    this.setState({ mermaidUnchanged: this.state.mermaid });
  }

  onNew = async () => {
    if (this.fileChanged && !areYouSure()) {
      return;
    }

    this.setState({
      mermaid: '',
      mermaidUnchanged: '',
      mermaidFilePath: null
    });
  }

  onSetRef = (ref: HTMLDivElement | null) => {
    if (ref === null) {
      this.mermaidRef = null;
    } else {
      const svgs = ref.getElementsByTagName('svg');
      if (svgs.length) {
        this.mermaidRef = svgs[0];
      } else {
        this.mermaidRef = null;
      }
    }
  }

  onExport = (path: string | null | undefined = this.state.mermaidFilePath) => {
    if (!this.mermaidRef || !path) {
      return;
    }

    const targetFile = PdfExporter.pdfNameForFile(path);
    return PdfExporter.exportSvg(this.mermaidRef, targetFile);
  }

  onUpdateGraph = (value: string) => {
    this.setState({ mermaid: value });
  }

  render() {
    return (
      <div className='aquarius'>
        <div className='aquarius__nav'>
          <img src='./aquarius_small.svg' alt='Aquarius' height={21} />
          <Button onClick={this.onNew}>New</Button>
          <Button onClick={() => this.onOpen()}>Open</Button>
          <SubmitButton onClick={() => this.onSave()}>Save</SubmitButton>
          <SubmitButton onClick={() => this.onExport()} disabled={!this.isExistingFile || !this.mermaidRef}>Export</SubmitButton>
          <select onChange={e => this.setTheme(e.currentTarget.value as Theme)} value={this.state.theme}>
            {(['default', 'dark', 'neutral', 'forest'] as Theme[]).map(theme =>
              <option key={theme} value={theme}>{theme}</option>
            )}
          </select>
          <span className='aquarius__filename'>{this.getFileName()}</span>
        </div>

        <AceEditor
          mode='text'
          theme='github'
          onChange={this.onUpdateGraph}
          value={this.state.mermaid}
          editorProps={{ $blockScrolling: Infinity }}
          enableLiveAutocompletion={true}
          style={{ gridArea: 'ace' }}
          width='50vw'
          height='100%'
          annotations={this.state.errors}
          debounceChangePeriod={300}
        />
        <Mermaid
          style={{ gridArea: 'mermaid' }}
          onSetRef={this.onSetRef}
          onError={this.onMermaidError}
          onSuccess={this.onMermaidSuccess}
          theme={this.state.theme}
        >
          {this.state.mermaid + ''}
        </Mermaid>
      </div>
    );
  }
}
