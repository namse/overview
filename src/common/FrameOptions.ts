export enum FrameType {
  Pdf = 'Pdf',
  ExternalWindow = 'ExternalWindow',
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

export interface FrameInfo {
  id: string;
  type: FrameType;
}

export interface ExternalWindowFrameInfo extends FrameInfo {
  processFileLocation: string;
}

export class ExternalWindowFrameOptions extends FrameOptions {
  frameType: FrameType.ExternalWindow;
  externalWindowFrameInfo: ExternalWindowFrameInfo;
}