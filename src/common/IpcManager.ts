export type OnMessage = (channel: string, ...args: any[]) => void;

export interface IpcConnector {
  on(onMessage: OnMessage): void;
  send(channel: string, ...args: any[]): void;
}

type IpcMessageListener = (...args: any[]) => void;

export default class IpcManager {
  private readonly ipcMessageListenersMap: {
    [channel: string]: {
      ipcMessageListener: IpcMessageListener,
      isOnce: boolean,
    }[]
  } = {};

  constructor(
    private ipcConnector: IpcConnector,
  ) {

  }

  public send(channel: string, ...args: any[]): void {
    console.log(`send ${channel}`);
    this.ipcConnector.send(channel, ...args);
  }

  public waitUntilMessage(channel: string): Promise<any[]> {
    console.log(`waiting Message : ${channel}`);
    return new Promise((resolve) => {
      if (!this.ipcMessageListenersMap[channel]) {
        this.ipcMessageListenersMap[channel] = [];
      }

      this.ipcMessageListenersMap[channel].push({
        ipcMessageListener: (...args) => {
          console.log(`got Message : ${channel}, ${JSON.stringify(args, null, 2)}`);
          resolve(args);
        },
        isOnce: true,
      });
    });
  }

  public addIpcMessageListener<TListener extends IpcMessageListener>(channel: string, listener: TListener) {
    if (!this.ipcMessageListenersMap[channel]) {
      this.ipcMessageListenersMap[channel] = [];
    }

    this.ipcMessageListenersMap[channel].push({
      ipcMessageListener: listener,
      isOnce: false,
    });
  }

  public startIpcMessageListening() {
    this.ipcConnector.on((channel: string, ...args: any[]) => {
      console.log(`On Ipc Message : ${channel}, ${JSON.stringify(args, null, 2)}`);
      const ipcMessageListeners =  this.ipcMessageListenersMap[channel]

      if (!ipcMessageListeners || !ipcMessageListeners.length) {
        return;
      }

      ipcMessageListeners.forEach((listenerInfo) => {
        listenerInfo.ipcMessageListener(...args);
      });

      this.ipcMessageListenersMap[channel] = ipcMessageListeners.filter(listenerInfo => !listenerInfo.isOnce);
    });
  }
}
