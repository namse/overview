import { serverUrl } from "./settings";
import fetch from 'node-fetch';

type WindowInfo = {
  windowHandle: number;
  windowTitle: string;
  processFileLocation: string;
}

export default async function getWindowInfos(): Promise<WindowInfo[]> {
  const response = await fetch(`${serverUrl}api/window/windowInfos`);

  return response.json();
}
