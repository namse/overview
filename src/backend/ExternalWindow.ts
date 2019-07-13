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
      path.resolve(windowInfo.processFileLocation) === path.resolve(this.frameOptions.externalWindowFrameInfo.processFileLocation));

    windowInfos.forEach(windowInfo => {
      console.log(path.resolve(windowInfo.processFileLocation));
    });

    console.log(path.resolve(this.frameOptions.externalWindowFrameInfo.processFileLocation));
    console.log(sameProcessFileLocationWindowInfos.length);

    if (sameProcessFileLocationWindowInfos.length === 1) {
      this.windowHandle = sameProcessFileLocationWindowInfos[0].windowHandle;
    } else {
      this.windowHandle = await this.chooseExternalWindow();
    }

    await this.showWindow();
    await this.moveWindow();
    await this.setWindowAlwaysOnTop();
  }

  chooseExternalWindow(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      let browserWindow = new BrowserWindow({
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

      const url = `file://${path.join(__dirname, '../frontend/index.html')}?id=${this.id}&src=./ExternalWindow/choose/index.js`;

      browserWindow.loadURL(url)

      browserWindow.webContents.openDevTools();

      let isResolved = false;

      browserWindow.on('closed', () => {
        console.log('browser closed');
        browserWindow = null;
        if (!isResolved) {
          console.log('browser closed before resolved');
          reject('browser closed before resolved');
        }
      });

      const [windowHandle] = await ipcManager.waitUntilMessage('onChooseWindowHandle');

      isResolved = true;
      resolve(windowHandle);

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

    const isScucessful = await response.json();
    if (!isScucessful) {
      console.log(`fail to move window(${this.windowHandle})`);
    }
  }

  async setWindowAlwaysOnTop(): Promise<void> {
    const response = await fetch(`${serverUrl}api/window/setWindowAlwaysOnTop?windowHandle=${this.windowHandle}`, {
      method: 'POST',
    });

    const errorCode = await response.json();
    if (errorCode != 0) {
      console.log(`fail to set window(${this.windowHandle}) always on top. errorCode: ${errorCode}`);
    }
  }

  public async stopWindowAlwaysOnTop(): Promise<void> {
    const response = await fetch(`${serverUrl}api/window/stopWindowAlwaysOnTop?windowHandle=${this.windowHandle}`, {
      method: 'POST',
    });

    const errorCode = await response.json();
    if (errorCode != 0) {
      console.log(`fail to stop window(${this.windowHandle}) always on top. errorCode: ${errorCode}`);
    }
  }

  public async showWindow(): Promise<void> {
    const response = await fetch(`${serverUrl}api/window/showWindow?windowHandle=${this.windowHandle}`, {
      method: 'POST',
    });

    const errorCode = await response.json();
    if (errorCode != 0) {
      console.log(`fail to show window(${this.windowHandle}). errorCode: ${errorCode}`);
    }
  }
}
