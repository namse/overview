import { WebviewTag } from "electron";

export default class WebFrame {
  readonly iframeElement: WebviewTag = document.createElement('webview');
  readonly containerElement: HTMLDivElement = document.createElement('div');

  constructor(
    private left: string,
    private top: string,
    private width: string,
    private height: string,
    private url: string,
  ) {
  }

  public async initialize(): Promise<void> {
    this.iframeElement.style.position = 'absolute';
    this.iframeElement.style.left = this.left;
    this.iframeElement.style.top = this.top;
    this.iframeElement.style.width = this.width;
    this.iframeElement.style.height = this.height;

    this.iframeElement.src = this.url;

    document.body.appendChild(this.iframeElement);
  }
}
