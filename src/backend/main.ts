import 'module-alias/register';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { app } from "electron";
import FrameWindow from "./FrameWindow";
import { PdfFrameOptions, FrameType, FrameInfo, ExternalWindowFrameInfo, ExternalWindowFrameOptions } from '@src/common/FrameOptions';
import getWindowInfos from '../common/ExternalWindow/getWindowInfos';
import ExternalWindow from './ExternalWindow';

const appSettingsPath = path.join(__dirname, './appSettings.yml');

const appSettingsString = fs.readFileSync(appSettingsPath, { encoding: 'utf-8'});

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

app.on("ready", async () => {
  try {
    const mainSceneInfo = appSettings.scenes.find(sceneInfo => sceneInfo.sceneName === 'main');

    if (!mainSceneInfo) {
      throw new Error(`cannot find 'main' scene in appSettings.yml`);
    }

    await Promise.all(mainSceneInfo.framePositionAndSizes.map(async (framePositionAndSize) => {
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

          await frameWindow.initialize();
        } break;
        case FrameType.ExternalWindow: {
          const externalWindowFrameInfo = frameInfo as ExternalWindowFrameInfo;
          const frameOptions: ExternalWindowFrameOptions = {
            frameType: FrameType.ExternalWindow,
            ...framePositionAndSize,
            externalWindowFrameInfo,
          };
          const externalWindow = new ExternalWindow(frameOptions);

          await externalWindow.initialize();
        } break;
      }
    }));
  } catch(err) {
    console.error(err);
  }
});
