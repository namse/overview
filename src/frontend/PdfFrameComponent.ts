import FrameComponent from "./Frame/FrameComponent";
import { remote } from 'electron';

const currentElectronWindow = remote.getCurrentWindow();

export default class PdfFrameComponent extends FrameComponent {
  readonly iframeElement: HTMLIFrameElement = document.createElement('iframe');

  public getElement(): HTMLElement {
    return this.iframeElement;
  }

  constructor(
    private left: string,
    private top: string,
    private width: string,
    private height: string,
    private url: string,
  ) {
    super();
  }

  public async initialize(): Promise<void> {
    this.iframeElement.style.position = 'absolute';
    this.iframeElement.style.left = this.left;
    this.iframeElement.style.top = this.top;
    this.iframeElement.style.width = this.width;
    this.iframeElement.style.height = this.height;

    this.iframeElement.src = 'https://mozilla.github.io/pdf.js/web/viewer.html?file=https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
  }
}
