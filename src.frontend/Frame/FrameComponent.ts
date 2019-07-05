export default abstract class FrameComponent {
  public abstract async initialize(): Promise<void>;
  public abstract getElement(): HTMLElement;
}
