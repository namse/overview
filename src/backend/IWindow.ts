export interface IWindow {
  id: string;
  initialize(): Promise<void>;
}