import * as React from "react";
import { ipcRenderer } from "electron";

class IPC extends React.Component {
  componentDidMount() {
    this.forEachChannel(([channel, handler]) => {
      ipcRenderer.on(channel, handler);
    });
  }

  componentWillUnmount() {
    this.forEachChannel(([channel, handler]) => {
      ipcRenderer.removeListener(channel, handler);
    });
  }

  forEachChannel(cb) {
    Object.entries(this.props).forEach(cb);
  }

  render() {
    return null;
  }
}

export default IPC;
