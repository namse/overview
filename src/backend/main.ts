import 'module-alias/register';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { app } from "electron";
import FrameWindow from "./FrameWindow";
import { PdfFrameOptions, FrameType } from '@src/common/FrameOptions';

const appSettingsPath = path.join(__dirname, './appSettings.yml');

const appSettingsString = fs.readFileSync(appSettingsPath, { encoding: 'utf-8'});

interface FrameInfo {
  id: string;
  type: FrameType;
}

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
      }
    }
  }));
});
