import { BrowserWindow, ipcMain, Event } from 'electron';
import * as path from 'path';
import * as uuid from 'uuid/v4';
import IpcManager, { OnMessage } from '@src/common/IpcManager';
import { FrameOptions } from '@src/common/FrameOptions';
import { IWindow } from './IWindow';
import { app } from "electron";
import { FramePositionAndSize } from './main';

export let hiddenBrowserWindow: BrowserWindow;

app.on('ready', () => {
  hiddenBrowserWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    alwaysOnTop: false,
    frame: false,
    transparent: true,
    skipTaskbar: true,
  });
  hiddenBrowserWindow.hide();
})

export default class FrameWindow implements IWindow {
  public initialized: boolean = false;
  public browserWindow: BrowserWindow;
  public readonly id: string = uuid();
  private ipcManager: IpcManager;

  constructor(
    private frameOptions: FrameOptions,
  ) {
  }

  async initialize(): Promise<void> {
    const {
      x,
      y,
      height,
      width,
    } = this.frameOptions;

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

    const url = `file://${path.join(__dirname, '../frontend/index.html')}?id=${this.id}&src=./renderer.js`;

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

    this.browserWindow.loadURL(url)

    this.browserWindow.webContents.openDevTools();

    this.browserWindow.on('closed', () => {
      console.log('browser closed');
    });

    this.ipcManager.addIpcMessageListener('onOpenWindow', () => {
      this.ipcManager.send('frameOptions', this.frameOptions);
    });

    // Initialize Browser Window as Frame Window

    this.initialized = true;
  }
  async updatePositionAndSize(framePositionAndSize: FramePositionAndSize): Promise<void> {
    const { x, y, width, height } = framePositionAndSize;

    this.frameOptions.x = x;
    this.frameOptions.y = y;
    this.frameOptions.width = width;
    this.frameOptions.height = height;

    this.browserWindow.setPosition(x, y);
    this.browserWindow.setSize(width, height);
  }
}
