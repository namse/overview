import FrameComponent from "../Frame/FrameComponent";

export default class SizeChangeFrameComponent extends FrameComponent {
  public async initialize(): Promise<void> {
  }
  public getElement(): HTMLElement {
    throw new Error("Method not implemented.");
  }
}
