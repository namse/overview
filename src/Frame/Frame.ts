import Container from "./Container";
import FrameComponent from "./FrameComponent";

export default class Frame {
  private readonly container: Container = new Container();
  private readonly frameComponents: FrameComponent[];

  public constructor(...frameComponents: FrameComponent[]) {
    this.frameComponents = frameComponents;
  }

  public async initialize(): Promise<void> {
    await this.container.initialize();

    const elements = await Promise.all(this.frameComponents.map(async frameComponent => {
      await frameComponent.initialize();
      return await frameComponent.getElement();
    }));

    this.container.attachElements(elements);
  }
}
