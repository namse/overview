export enum FrameType {
  Pdf = 'Pdf',
}

export abstract class FrameOptions {
  abstract frameType: FrameType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class PdfFrameOptions extends FrameOptions {
  frameType: FrameType.Pdf;
  src: string;
}
