import { WebviewTag } from "electron";
import FrameComponent from "./Frame/FrameComponent";
import { remote } from 'electron';

const currentElectronWindow = remote.getCurrentWindow();

export default class PdfFrameComponent extends FrameComponent {
  readonly iframeElement: WebviewTag = document.createElement('webview');

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

    this.iframeElement.src = this.url;
    this.iframeElement.plugins = 'true';
  }
}
