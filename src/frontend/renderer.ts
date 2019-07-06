import 'module-alias/register';
import Frame from "./Frame/Frame";
import PdfFrameComponent from "./PdfFrameComponent";
import { ipcRenderer, Event } from 'electron';
import IpcManager, { OnMessage } from "@src/common/IpcManager";
import { FrameOptions, FrameType, PdfFrameOptions } from '@src/common/FrameOptions';

declare const id: string;

console.log(id);

const ipcManager: IpcManager = new IpcManager({
  on(onMessage: OnMessage) {
    ipcRenderer.on(id, (event: Event, channel: string, ...args: any[]) => {
      onMessage(channel, ...args);
    });
  },
  send(channel: string, ...args: any[]) {
    ipcRenderer.send(id, channel, ...args);
  },
});
ipcManager.startIpcMessageListening();

ipcManager.addIpcMessageListener('frameOptions', async (frameOptions: FrameOptions) => {
  console.log(frameOptions);

  switch (frameOptions.frameType) {
    case FrameType.Pdf: {
      const pdfFrameOptions = frameOptions as PdfFrameOptions;
      const pdfFrameComponent =  new PdfFrameComponent(
        '0px',
        '0px',
        `${pdfFrameOptions.width}px`,
        `${pdfFrameOptions.height}px`,
        pdfFrameOptions.src,
      );

      const pdfFrame = new Frame(pdfFrameComponent);

      await pdfFrame.initialize();
    }
  }
});

ipcManager.send('onOpenWindow');
