import FrameComponent from "../Frame/FrameComponent";

export default class DivFrameComponent extends FrameComponent {
  private readonly divElement: HTMLDivElement = document.createElement('div');

  public async initialize(): Promise<void> {
  }

  public getElement(): HTMLElement {
    return this.divElement;
  }
}
