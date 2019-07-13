import { FramePositionAndSize } from "./main";

export interface IWindow {
  id: string;
  initialized: boolean;
  initialize(): Promise<void>;
  updatePositionAndSize(framePositionAndSize: FramePositionAndSize): Promise<void>;
}