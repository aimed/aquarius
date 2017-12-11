import * as electron from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const htmlTemplate = (svg: SVGElement) => `
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
  <body>${svg.outerHTML}</body>
</html>
`;

export class PdfExporter {
    static pdfNameForFile(fileName: string): string {
        const filePath = path.parse(fileName);
        return (filePath.ext ? fileName.replace(filePath.ext, '') : fileName) + '.pdf';
    }

    static getActualSvgSize(svg: SVGElement): ClientRect {
        const groups = svg.getElementsByTagName('g');

        if (!groups || !groups.length) {
            throw new Error('Expected a valid mermaid svg with at least one sub group.');
        }

        return groups[0].getBoundingClientRect();
    }

    static exportSvg = (svg: SVGElement, filePath: string) => new Promise((resolve, reject) => {
        const html = htmlTemplate(svg);
        const size = PdfExporter.getActualSvgSize(svg);

        // A page is printed with 72 dpi, so to get the proper pdf page size we need to multiply.
        // We also need to cast this, since the electron definitions don't accept objects for pageSize.
        const pageSize = { height: 72 * (size.height), width: 72 * (size.width) } as any;

        // Open a hidden window with the exact same size as the pdf and render the svg in it.
        const win = new electron.remote.BrowserWindow({ width: size.width, height: size.height, show: false });
        win.loadURL('data:text/html;charset=utf-8,' + encodeURI(html));
        win.webContents.on('did-finish-load', () => {
            // Once the page has loaded, we print it on a page that has the same size as the svg.
            win.webContents.printToPDF({ marginsType: 1, pageSize }, (err, data) => {
                if (err) {
                    reject(err);
                } else if (data) {
                    fs.writeFile(filePath, data, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    })
}
