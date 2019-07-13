import 'module-alias/register';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { app, globalShortcut } from 'electron';
import FrameWindow from './FrameWindow';
import { PdfFrameOptions, FrameType, FrameInfo, ExternalWindowFrameInfo, ExternalWindowFrameOptions } from '@src/common/FrameOptions';
import ExternalWindow from './ExternalWindow';
import { IWindow } from './IWindow';


const appSettingsPath = path.join(__dirname, './appSettings.yml');

const appSettingsString = fs.readFileSync(appSettingsPath, { encoding: 'utf-8' });

interface PdfFrameInfo extends FrameInfo {
  src: string;
}

export interface FramePositionAndSize {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

type AppSettings = {
  frames: FrameInfo[],
  scenes: {
    sceneName: string,
    framePositionAndSizes: FramePositionAndSize[],
  }[],
}

const appSettings = yaml.parse(appSettingsString) as AppSettings;


const allWindowsMap: {[id: string]: IWindow} = {};

function createFrameWindow(framePositionAndSize: FramePositionAndSize): IWindow {
  const frameInfo = appSettings.frames.find(frame => frame.id === framePositionAndSize.id);

  let window: IWindow;
  switch (frameInfo.type) {
    case FrameType.Pdf: {
      const pdfFrameInfo = frameInfo as PdfFrameInfo;
      const frameOptions: PdfFrameOptions = {
        frameType: FrameType.Pdf,
        ...framePositionAndSize,
        ...pdfFrameInfo,
      };
      window = new FrameWindow(frameOptions);
    } break;
    case FrameType.ExternalWindow: {
      const externalWindowFrameInfo = frameInfo as ExternalWindowFrameInfo;
      console.log(externalWindowFrameInfo);
      const frameOptions: ExternalWindowFrameOptions = {
        frameType: FrameType.ExternalWindow,
        ...framePositionAndSize,
        externalWindowFrameInfo,
      };
      window = new ExternalWindow(frameOptions);
    } break;
  }

  allWindowsMap[framePositionAndSize.id] = window;
  return window;
}

async function initializedWindows(windows: IWindow[]): Promise<void> {
  const externalWindows = windows.filter((window): window is ExternalWindow => window instanceof ExternalWindow);
  const nonExternalWindows = windows.filter((window): window is FrameWindow => !(window instanceof ExternalWindow));

  await Promise.all(externalWindows.map(async externalWindow => {
    await externalWindow.initialize();
    console.log(`externalWindow(${externalWindow.id}) initliazed`);
  }));

  await Promise.all(nonExternalWindows.map(async nonExternalWindow => {
    await nonExternalWindow.initialize();
    console.log(`nonExternalWindow(${nonExternalWindow.id}) initliazed`);
  }));
}

async function changeScene(sceneName: string) {
  try {
    const sceneInfo = appSettings.scenes.find(sceneInfo => sceneInfo.sceneName === sceneName);

    if (!sceneInfo) {
      throw new Error(`cannot find '${sceneName}' scene in appSettings.yml`);
    }

    const windows = sceneInfo.framePositionAndSizes.map(framePositionAndSize => {
      let window = allWindowsMap[framePositionAndSize.id];
      if (!window) {
        window = createFrameWindow(framePositionAndSize);
      }
      return window;
    });

    const notInitializedWindows = windows.filter(window => !window.initialized);

    if (notInitializedWindows.length) {
      await initializedWindows(notInitializedWindows);
    }

    await Promise.all(sceneInfo.framePositionAndSizes.map(async (framePositionAndSize) => {
      const window = allWindowsMap[framePositionAndSize.id];
      await window.updatePositionAndSize(framePositionAndSize);
    }));
    console.log('done');
  } catch (err) {
    console.error(err);
  }
}

app.on('ready', async () => {
  for (let i = 0; i < 9; i += 1) {
    globalShortcut.register(`Ctrl+Alt+Shift+${i + 1}`, () => {
      const scene = appSettings.scenes[i];
      if (!scene) {
        return;
      }
      console.log(`changeScene(${scene.sceneName})`);
      changeScene(scene.sceneName);
    });
  }

  await changeScene('main');
});

async function exitHandler(options: { cleanup?: boolean, exit?: boolean }, exitCode: number) {
  if (options.cleanup) {
    console.log('clean');
  }
  if (exitCode || exitCode === 0) {
    console.log(exitCode);
  }

  const externalWindows = Object.values(allWindowsMap).filter((window): window is ExternalWindow => window instanceof ExternalWindow);
  if (externalWindows) {
    await Promise.all(externalWindows.map(externalWindow => externalWindow.stopWindowAlwaysOnTop()));
  }

  if (options.exit) {
    process.exit();
  }
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));

process.on('SIGTERM', function () {
  console.log('SIGTERM');
});

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches 'kill pid' (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
