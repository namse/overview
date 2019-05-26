export type CameraFrameOption = {
  left: string,
  top: string,
  width: string,
  height: string,
  cropInfo?: {
    top: number,
    right: number,
    bottom: number,
    left: number,
  },
  deviceId: string,
  isHorizontallyFlipped: boolean,
  isMuted: boolean,
}

export default class CameraFrame {
  private readonly videoElement: HTMLVideoElement = document.createElement('video');;
  private readonly containerElement: HTMLDivElement = document.createElement('div');

  constructor(
    private option: CameraFrameOption,
  ) {
    this.containerElement.style.position = 'absolute';
    this.containerElement.style.left = option.left;
    this.containerElement.style.top = option.top;
    this.containerElement.style.width = option.width;
    this.containerElement.style.height = option.height;
    this.containerElement.style.overflow = 'hidden';

    this.videoElement.style.transform = option.isHorizontallyFlipped ? 'scaleX(-1)' : '';

    this.videoElement.style.position = 'absolute';
    if (option.cropInfo) {
      this.videoElement.style.left = `-${option.cropInfo.left}px`;
      this.videoElement.style.top = `-${option.cropInfo.top}px`;
    }

    this.videoElement.autoplay = true;
    this.videoElement.muted = option.isMuted;
  }

  public async initialize(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: this.option.deviceId,
      },
    });

    this.videoElement.srcObject = stream;

    this.containerElement.appendChild(this.videoElement);
    document.body.appendChild(this.containerElement);
  }
}
