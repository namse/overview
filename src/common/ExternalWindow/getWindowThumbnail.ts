import { serverUrl } from "./settings";

export function getWindowThumbnailUrl(windowHandle: number): string {
  return `${serverUrl}api/window/windowThumbnail?windowHandle=${windowHandle}`;
}
