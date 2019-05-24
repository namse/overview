export default class CameraFrame {
  private readonly videoElement: HTMLVideoElement;

  constructor(
    private left: string,
    private top: string,
    private width: string,
    private height: string,
    private isMuted: boolean = true,
  ) {
    this.videoElement = document.createElement('video');

    this.videoElement.style.position = 'absolute';
    this.videoElement.style.left = left;
    this.videoElement.style.top = top;
    this.videoElement.style.width = width;
    this.videoElement.style.height = height;

    this.videoElement.autoplay = true;
    this.videoElement.muted = isMuted
  }

  public async load(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({video: true});
    this.videoElement.srcObject = stream;;
  }

  public get element(): HTMLElement {
    return this.videoElement;
  }
}
