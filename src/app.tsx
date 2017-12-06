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
import * as path from 'path';

import AceEditor, { Annotation } from 'react-ace';

import { Button } from './Button/Button';
import { Files } from './Files';
import { Mermaid } from './Mermaid/Mermaid';
import { PdfExporter } from './PdfExporter';
import { Theme } from 'mermaid';

export interface AppState {
  mermaid?: string;
  mermaidFilePath?: string | null;
  errors?: Annotation[];
  theme?: Theme;
}

export class App extends React.Component<{}, AppState> {
  state: AppState = {
    mermaid: '',
    mermaidFilePath: window.localStorage['lastMermaidFilePath'] || null,
    theme: window.localStorage['theme'] || 'default'
  };

  mermaidRef: SVGElement | null = null;

  async componentWillMount() {
    if (this.state.mermaidFilePath) {
      const content = await Files.readFile(this.state.mermaidFilePath);
      this.setState({ mermaid: content });
    }
  }

  get isExistingFile(): boolean {
    return !!this.state.mermaidFilePath;
  }

  get currentFileName(): string | null {
    const { mermaidFilePath } = this.state;

    if (mermaidFilePath) {
      const p = path.parse(mermaidFilePath);
      return p.name + p.ext;
    }

    return null;
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
      this.state.mermaidFilePath
      ? window.localStorage.setItem('lastMermaidFilePath', this.state.mermaidFilePath)
      : window.localStorage.removeItem('lastMermaidFilePath');
    }

    if (nextState.theme !== this.state.theme) {
      window.localStorage.setItem('theme', this.state.theme as string);
    }
  }

  onOpen = async () => {
    const fileName = await Files.selectReadFile();

    if (!fileName) {
      return;
    }

    const mermaid = await Files.readFile(fileName);

    this.setState({
      mermaidFilePath: fileName,
      mermaid
    });
  }

  onSave = async () => {
    const { mermaidFilePath, mermaid } = this.state;
    let saveFilePath: string | null | undefined = mermaidFilePath;

    if (!saveFilePath) {
      saveFilePath = await Files.selectReadFile();
    }

    if (saveFilePath) {
      await Files.writeFile(saveFilePath, mermaid + '');
    }
  }

  onNew = () => {
    this.setState({
      mermaid: '',
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

    return (
      <div style={containerStyle} className='aquarius'>
        <div style={{ padding: '0.5em', borderBottom: '1px solid #f6f6f6', gridArea: 'nav' }} className='aquarius__nav'>
          <Button onClick={this.onNew}>New</Button>
          <Button onClick={this.onOpen}>Open</Button>
          <Button onClick={this.onSave}>Save</Button>
          <Button onClick={() => this.onExport()} disabled={!this.isExistingFile || !this.mermaidRef}>Export</Button>
          <select onChange={e => this.setTheme(e.currentTarget.value as Theme)} value={this.state.theme}>
            {(['default', 'dark', 'neutral', 'forest'] as Theme[]).map(theme =>
              <option key={theme} value={theme}>{theme}</option>
            )}
          </select>
          {this.state.mermaidFilePath && <span>{this.currentFileName}</span>}
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