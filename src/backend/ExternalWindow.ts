import { IWindow } from "./IWindow";
import { ExternalWindowFrameOptions } from "@src/common/FrameOptions";
import getWindowInfos from "../common/ExternalWindow/getWindowInfos";
import * as uuid from 'uuid/v4';
import { BrowserWindow } from "electron";
import IpcManager, { OnMessage } from "@src/common/IpcManager";
import * as path from 'path';
import fetch from 'node-fetch';
import { serverUrl } from "@src/common/ExternalWindow/settings";

type MoveWindowRequestBody = {
  windowHandle: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default class ExternalWindow implements IWindow {
  private windowHandle: number | undefined;
  public readonly id: string = uuid();

  constructor(private frameOptions: ExternalWindowFrameOptions) {

  }

  async initialize(): Promise<void> {
    const windowInfos = await getWindowInfos();

    const sameProcessFileLocationWindowInfos = windowInfos.filter(windowInfo =>
      windowInfo.processFileLocation === this.frameOptions.externalWindowFrameInfo.processFileLocation);

    if (sameProcessFileLocationWindowInfos.length === 1) {
      this.windowHandle = sameProcessFileLocationWindowInfos[0].windowHandle;
    } else {
      this.windowHandle = await this.chooseExternalWindow();
    }

    console.log('before moveWindow');

    await this.moveWindow();

    console.log('after moveWindow');

    console.log(this.windowHandle);
  }

  chooseExternalWindow(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      const browserWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        frame: false,
        webPreferences: {
          nodeIntegration: true, // TODO : Remove this for security
        },
      });

      const ipcManager = new IpcManager({
        on: (onMessage: OnMessage) => {
          browserWindow.webContents.on('ipc-message', (event: Event, id: string, channel: string, ...args: any[]) => {
            onMessage(channel, ...args);
          });
        },
        send: (channel: string, ...args: any[]) => {
          browserWindow.webContents.send(this.id, channel, ...args);
        },
      });

      ipcManager.startIpcMessageListening();

      const url = `file://${path.join(__dirname, '../frontend/ExternalWindow/choose/index.html')}?id=${this.id}`;

      browserWindow.loadURL(url)

      browserWindow.webContents.openDevTools();

      browserWindow.on('closed', () => {
        reject('browser closed');
      });

      const [windowHandle] = await ipcManager.waitUntilMessage('onChooseWindowHandle');
      console.log(windowHandle);
      console.log('before resolve');
      resolve(windowHandle);
      console.log('after resolve');
      browserWindow.close();
    });
  }

  async moveWindow(): Promise<void> {

    const body: MoveWindowRequestBody = {
      windowHandle: this.windowHandle,
      x: this.frameOptions.x,
      y: this.frameOptions.y,
      width: this.frameOptions.width,
      height: this.frameOptions.height,
    };

    const response = await fetch(`${serverUrl}api/window/moveWindow`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.warn(await response.json());
  }
}
