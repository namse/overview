import 'module-alias/register';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { app } from "electron";
import FrameWindow from "./FrameWindow";
import { PdfFrameOptions, FrameType, FrameInfo, ExternalWindowFrameInfo, ExternalWindowFrameOptions } from '@src/common/FrameOptions';
import ExternalWindow from './ExternalWindow';

const appSettingsPath = path.join(__dirname, './appSettings.yml');

const appSettingsString = fs.readFileSync(appSettingsPath, { encoding: 'utf-8' });

interface PdfFrameInfo extends FrameInfo {
  src: string;
}

interface FramePositionAndSize {
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

let externalWindows: ExternalWindow[];

app.on("ready", async () => {
  try {
    const mainSceneInfo = appSettings.scenes.find(sceneInfo => sceneInfo.sceneName === 'main');

    if (!mainSceneInfo) {
      throw new Error(`cannot find 'main' scene in appSettings.yml`);
    }

    const frameWindows = await Promise.all(mainSceneInfo.framePositionAndSizes.map(async (framePositionAndSize) => {
      const frameInfo = appSettings.frames.find(frame => frame.id === framePositionAndSize.id);

      switch (frameInfo.type) {
        case FrameType.Pdf: {
          const pdfFrameInfo = frameInfo as PdfFrameInfo;
          const frameOptions: PdfFrameOptions = {
            frameType: FrameType.Pdf,
            ...framePositionAndSize,
            ...pdfFrameInfo,
          };
          const frameWindow = new FrameWindow(frameOptions);
          return frameWindow;
        }
        case FrameType.ExternalWindow: {
          const externalWindowFrameInfo = frameInfo as ExternalWindowFrameInfo;
          const frameOptions: ExternalWindowFrameOptions = {
            frameType: FrameType.ExternalWindow,
            ...framePositionAndSize,
            externalWindowFrameInfo,
          };
          const externalWindow = new ExternalWindow(frameOptions);
          return externalWindow;
        }
      }
    }));

    externalWindows = frameWindows.filter((frameWindow): frameWindow is ExternalWindow => frameWindow instanceof ExternalWindow);
    const nonExternalWindows = frameWindows.filter((frameWindow): frameWindow is FrameWindow => !(frameWindow instanceof ExternalWindow));

    await Promise.all(externalWindows.map(async externalWindow => {
      await externalWindow.initialize();
      console.log(`externalWindow(${externalWindow.id}) initliazed`);
    }));

    await Promise.all(nonExternalWindows.map(async nonExternalWindow => {
      await nonExternalWindow.initialize();
      console.log(`nonExternalWindow(${nonExternalWindow.id}) initliazed`);
    }));
    console.log('done');
  } catch (err) {
    console.error(err);
  }
});

async function exitHandler(options: { cleanup?: boolean, exit?: boolean }, exitCode: number) {
  if (options.cleanup) {
    console.log('clean');
  }
  if (exitCode || exitCode === 0) {
    console.log(exitCode);
  }

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

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
