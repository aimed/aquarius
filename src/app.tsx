import 'brace';
import 'brace/mode/java';
import 'brace/theme/github';
import 'brace/ext/language_tools';

import * as React from 'react';
import * as electron from 'electron';
import * as fs from 'fs';
import * as path from 'path';

import AceEditor from 'react-ace';
import { Button } from './Button/Button';
import { Mermaid } from './Mermaid/Mermaid';
import { SplitView } from './SplitView/SplitView';

export interface AppState {
  mermaidRaw: string;
  rawFilePath?: string | null;
  exportFilePath?: string | null;
}

export class App extends React.Component<{}, AppState> {
  state: AppState = {
    mermaidRaw: window.localStorage['lastMermaid'] || '',
  };

  mermaidRef: SVGElement | null = null;

  get exportPath(): string | null {
    return window.localStorage['exportPath'];
  }

  set exportPath(value: string | null) {
    window.localStorage['exportPath'] = value;
  }

  open = () => {
    electron.remote.dialog.showOpenDialog(
      electron.remote.getCurrentWindow(),
      {},
      fileName => {
        if (fileName && fileName.length) {
          fs.readFile(fileName[0], null, (err, data) => {
            if (err) {
              alert(err);
            } else {
              this.setState({
                rawFilePath: fileName[0],
                exportFilePath: null,
                mermaidRaw: data.toString(),
              });
            }
          });
        }
      }
    );
  }

  save = () => {
    const { rawFilePath, mermaidRaw } = this.state;
    if (rawFilePath && mermaidRaw) {
      fs.writeFile(rawFilePath, mermaidRaw, (err) => {
        if (err) {
          alert(err);
        }
      });
    }
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

  get printableHtml(): string {
    return this.mermaidRef ? `
      <html>
        <style>
        html,
        body {
          margin: 0;
          padding: 0;
        }

        svg {
          width: 100vw;
          height: 100vh;
        }

        * {
          page-break-after: avoid;
        }
        </style>
        <body>${this.mermaidRef.outerHTML}</body>
      </html>
    ` : ``;
  }

  onExportAs = () => {
    electron.remote.dialog.showSaveDialog(
      electron.remote.getCurrentWindow(),
      { defaultPath:
          this.state.exportFilePath && path.dirname(this.state.exportFilePath)
          || this.exportPath
          || path.join(__dirname, '..', 'mermaid.pdf') },
      fileName => {
        if (fileName) {
          this.exportPath = fileName.endsWith('.pdf') ? fileName : fileName + '.pdf';
          this.onExport();
        }
      }
    );
  }

  onExport = () => {
    if (!this.mermaidRef) {
      return;
    }

    if (!this.exportPath) {
      this.onExportAs();
      return;
    }

    const targetFile = this.exportPath;

    // Use the group size to properly calucalte the size of the svg.
    const groups = this.mermaidRef.getElementsByTagName('g');

    if (!groups || !groups.length) {
      return;
    }

    const size = groups[0].getBoundingClientRect();
    const pageSize = { height: 72 * (size.height), width: 72 * (size.width) } as any;
    const html = this.printableHtml;
    const win = new electron.remote.BrowserWindow({ width: size.width, height: size.height, show: false });

    win.loadURL('data:text/html;charset=utf-8,' + encodeURI(html));
    win.webContents.on('did-finish-load', () => {
      win.webContents.printToPDF({ marginsType: 1, pageSize }, (err, data) => {
        if (err) {
          alert(err);
        } else if (data) {
          fs.writeFile(targetFile, data, (err2) => {
            if (err2) {
              alert(err2);
            }
          });
        }
      });
    });
  }

  onUpdateGraph = (value: string) => {
    this.setState({ mermaidRaw: value });
    window.localStorage['lastMermaid'] = value;
  }

  render() {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0.5em', borderBottom: '1px solid #f6f6f6' }}>
          <Button onClick={this.open}>Open</Button>
          <Button onClick={this.save} disabled={!this.state.rawFilePath}>Save</Button>
          <Button onClick={this.onExport}>Export</Button>
          <Button onClick={this.onExportAs}>Export as</Button>
        </div>

        <SplitView
          containerStyle={{ flex: 1 }}
          left={
            // <MermaidInput style={{ flex: 1 }} value={this.state.mermaidRaw} onChange={this.onUpdateGraph} />
            <AceEditor
              mode='java'
              theme='github'
              onChange={this.onUpdateGraph}
              name='UNIQUE_ID_OF_DIV'
              editorProps={{$blockScrolling: true}}
              value={this.state.mermaidRaw}
              enableLiveAutocompletion={true}
            />
          }
          right={
            <Mermaid style={{ flex: 1 }} onSetRef={this.onSetRef}>{this.state.mermaidRaw}</Mermaid>
          }
        />
      </div>
    );
  }
}