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

import { Button } from './Button/Button';
import { Files } from './Files';
import { Mermaid } from './Mermaid/Mermaid';
import { PdfExporter } from './PdfExporter';
import { Theme } from 'mermaid';
import { areYouSure } from './utils/areYouSure';

export interface AppState {
  mermaid?: string;
  mermaidUnchanged?: string;
  mermaidFilePath?: string | null;
  errors?: Annotation[];
  theme?: Theme;
}

export class App extends React.Component<{}, AppState> {
  state: AppState = {
    mermaid: '',
    mermaidUnchanged: '',
    mermaidFilePath: window.localStorage['lastMermaidFilePath'] || null,
    theme: window.localStorage['theme'] || 'default'
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
  }

  componentWillUnmount() {
    electron.remote.getCurrentWindow().removeListener('close', this.handleClose);
    // electron.remote.app.removeListener('before-quit', this.handleClose);
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
      nextState.mermaidFilePath
      ? window.localStorage.setItem('lastMermaidFilePath', nextState.mermaidFilePath)
      : window.localStorage.removeItem('lastMermaidFilePath');
    }

    if (nextState.theme !== this.state.theme) {
      window.localStorage.setItem('theme', nextState.theme as string);
    }
  }

  getTitle(state: AppState = this.state): string {
    const hasChanged = state.mermaid !== state.mermaidUnchanged;
    const title = (state.mermaidFilePath || '') + (hasChanged ? ' (unsaved)' : '');
    return title;
  }

  onOpen = async (fileName?: string | null) => {
    if (this.fileChanged && !areYouSure()) {
      return;
    }

    if (!fileName) {
      fileName = await Files.selectReadFile();
    }

    if (!fileName) {
      return;
    }

    const mermaid = await Files.readFile(fileName);

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
      saveFilePath = await Files.selectWriteFile();
    }

    if (saveFilePath) {
      await Files.writeFile(saveFilePath, mermaid + '');
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
    PdfExporter.exportSvg(this.mermaidRef, targetFile);
  }

  onUpdateGraph = (value: string) => {
    this.setState({ mermaid: value });
  }

  render() {
    const containerStyle: React.CSSProperties = {
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'grid',
      gridTemplateColumns: 'auto',
      gridTemplateRows: 'auto 1fr',
      gridTemplateAreas: `
        "nav nav"
        "ace mermaid"
      `,
    };

    const navStyle: React.CSSProperties = {
      padding: '0.5em',
      borderBottom: '1px solid #f6f6f6',
      gridArea: 'nav',
      display: 'flex',
      alignItems: 'center'
    };

    const titleStyle: React.CSSProperties = {
      fontSize: '0.7em',
      color: '#999999',
      marginLeft: '1em'
    };

    return (
      <div style={containerStyle} className='aquarius'>
        <div style={navStyle} className='aquarius__nav'>
          <img src='./aquarius.svg' alt='Aquarius' height={20} />
          <Button onClick={this.onNew}>New</Button>
          <Button onClick={() => this.onOpen()}>Open</Button>
          <Button onClick={this.onSave}>Save</Button>
          <Button onClick={() => this.onExport()} disabled={!this.isExistingFile || !this.mermaidRef}>Export</Button>
          <select onChange={e => this.setTheme(e.currentTarget.value as Theme)} value={this.state.theme}>
            {(['default', 'dark', 'neutral', 'forest'] as Theme[]).map(theme =>
              <option key={theme} value={theme}>{theme}</option>
            )}
          </select>
          <span style={titleStyle}>{this.getTitle()}</span>
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