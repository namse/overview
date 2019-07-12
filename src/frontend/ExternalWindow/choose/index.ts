import 'module-alias/register';
import { ipcRenderer, Event } from 'electron';
import IpcManager, { OnMessage } from '@src/common/IpcManager';
import getWindowInfos from '@src/common/ExternalWindow/getWindowInfos';
import { getWindowThumbnailUrl } from '@src/common/ExternalWindow/getWindowThumbnail';

declare const id: string;

console.log(id);

document.body.style.overflow = 'auto';

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

ipcManager.send('onOpenWindow');

async function main() {
  const windowInfos = await getWindowInfos();


  http://localhost:34343/api/window/windowThumbnail?windowHandle=133316


  windowInfos.forEach(windowInfo => {
    /*
      <div>
        <img />
        <span>{title}</span>
        <span>{filename}</span>
        <button>Choose / 선택하기</button>
      </div>
    */
    const div = document.createElement('div');

    const img = document.createElement('img');
    img.src = getWindowThumbnailUrl(windowInfo.windowHandle);
    div.appendChild(img);

    const titleSpan = document.createElement('span');
    titleSpan.textContent = windowInfo.windowTitle;
    div.appendChild(titleSpan);

    const filenameSpan = document.createElement('span');
    const splitted = windowInfo.processFileLocation.split('\\');
    const realFilename = splitted[splitted.length - 1];
    filenameSpan.textContent = realFilename;
    div.appendChild(filenameSpan);

    const button = document.createElement('button');
    button.textContent = 'Choose / 선택하기';
    button.onclick = () => {
      console.log(windowInfo.windowHandle);
      ipcManager.send('onChooseWindowHandle', windowInfo.windowHandle);
    };
    div.appendChild(button);

    document.body.appendChild(div);
  })
}

main().catch(err => console.error(err));
