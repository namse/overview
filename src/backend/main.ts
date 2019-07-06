import 'module-alias/register';
import { app } from "electron";
import FrameWindow from "./FrameWindow";
import { PdfFrameOptions, FrameType } from '@src/common/FrameOptions';

app.on("ready", async () => {

  const frameOptions: PdfFrameOptions = {
    frameType: FrameType.Pdf,
    x: 0,
    y: 0,
    width: 960,
    height: 540,
    src: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  };
  const frameWindow = new FrameWindow(frameOptions);

  await frameWindow.initialize();
});
