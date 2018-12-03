import * as React from "react";
import { ipcRenderer } from "electron";
import { ServerEvents } from "../events/server-events";

export type EventHandlers = {
  [K in keyof ServerEvents]?: (event: ServerEvents[K]) => void
};

type Props = {
  handlers: EventHandlers;
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

  forEachChannel(
    cb: (keyValue: [keyof ServerEvents, (event: Object) => void]) => void
  ) {
    const keys = Object.keys(this.props.handlers) as Array<keyof ServerEvents>;
    keys.forEach(key => {
      const handler = this.props.handlers[key] as (event: Object) => void;
      cb([key, handler]);
    });
  }

  render(): null {
    return null;
  }
}

export default IPC;
