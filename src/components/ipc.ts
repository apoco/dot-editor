import * as React from "react";
import { ipcRenderer } from "electron";

type Props = {
  handlers: {
    [message: string]: (event: any) => any;
  };
};

class IPC extends React.Component<Props, {}> {
  componentDidMount() {
    this.forEachChannel(([channel, handler]) => {
      ipcRenderer.on(channel, (e: Event, payload: any) => handler(payload));
    });
  }

  componentWillUnmount() {
    this.forEachChannel(([channel, handler]) => {
      ipcRenderer.removeListener(channel, handler);
    });
  }

  forEachChannel(cb: (keyValue: [string, (event: any) => any]) => void) {
    Object.entries(this.props.handlers).forEach(cb);
  }

  render(): null {
    return null;
  }
}

export default IPC;
