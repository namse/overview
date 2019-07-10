import { BrowserWindow, ipcMain, Event } from 'electron';
import * as path from 'path';
import * as uuid from 'uuid/v4';
import IpcManager, { OnMessage } from '@src/common/IpcManager';
import { FrameOptions } from '@src/common/FrameOptions';
import { IWindow } from './IWindow';

export default class FrameWindow implements IWindow {
  public readonly browserWindow: BrowserWindow;
  public readonly id: string = uuid();
  private readonly ipcManager: IpcManager;

  constructor(
    private frameOptions: FrameOptions,
  ) {
    const {
      x,
      y,
      height,
      width,
    } = frameOptions;

    this.browserWindow = new BrowserWindow({
      x,
      y,
      height,
      width,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true, // TODO : Remove this for security
      },
    });

    this.ipcManager = new IpcManager({
      on: (onMessage: OnMessage) => {
        this.browserWindow.webContents.on('ipc-message', (event: Event, id: string, channel: string, ...args: any[]) => {
          onMessage(channel, ...args);
        });
      },
      send: (channel: string, ...args: any[]) => {
        this.browserWindow.webContents.send(this.id, channel, ...args);
      },
    });

    this.ipcManager.startIpcMessageListening();
  }

  async initialize(): Promise<void> {
    const url = `file://${path.join(__dirname, '../frontend/index.html')}?id=${this.id}`;
    console.log(url);
    this.browserWindow.loadURL(url)

    this.browserWindow.webContents.openDevTools();

    this.browserWindow.on('closed', () => {
      console.log('browser closed');
    });

    this.ipcManager.addIpcMessageListener('onOpenWindow', () => {
      this.ipcManager.send('frameOptions', this.frameOptions);
    });

    // Initialize Browser Window as Frame Window
  }
}
