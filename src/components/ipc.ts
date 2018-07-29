import * as React from "react";
import { ipcRenderer } from "electron";

type Props = {
  handlers: {
    [message: string]: (any) => any
  }
}

class IPC extends React.Component<Props, {}> {
  componentDidMount() {
    this.forEachChannel(([channel, handler]) => {
      ipcRenderer.on(channel, (e, payload) => handler(payload));
    });
  }

  componentWillUnmount() {
    this.forEachChannel(([channel, handler]) => {
      ipcRenderer.removeListener(channel, handler);
    });
  }

  forEachChannel(cb) {
    Object.entries(this.props.handlers).forEach(cb);
  }

  render() {
    return null;
  }
}

export default IPC;
