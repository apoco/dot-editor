import { EventEmitter } from "events";
import { fromEvent } from "rxjs";
import { catchError, debounceTime, filter, flatMap, map } from "rxjs/operators";
import { BrowserWindow, ipcMain } from "electron";
import uuid from "uuid";

import renderSvg from "./render-svg";
import {
  DECREASE_FONT,
  INCREASE_FONT,
  RENDER_RESULT,
  SOURCE_CHANGED,
  WINDOW_CLOSED
} from "../constants/messages";

class WindowSession extends EventEmitter {
  id = uuid();
  window = null;
  webContents = null;
  subscriptions = [];

  constructor({ menu }) {
    super();

    const window = new BrowserWindow({ width: 800, height: 600 });
    window.loadFile("lib/ui/index.html");

    this.menu = menu;
    this.window = window;
    this.webContents = window.webContents;

    this.subscribeTo(
      fromEvent(this.webContents, "did-finish-load"),
      this.setupContent
    );

    this.subscribeTo(fromEvent(window, "closed"), this.handleWindowClosed);

    this.handleMenuEvent(INCREASE_FONT, () =>
      this.webContents.send(INCREASE_FONT)
    );
    this.handleMenuEvent(DECREASE_FONT, () =>
      this.webContents.send(DECREASE_FONT)
    );
  }

  setupContent = () => {
    this.subscribeTo(
      fromEvent(this.webContents, "did-finish-load"),
      this.handleWindowLoad
    );

    this.subscribeTo(
      this.windowMessages(SOURCE_CHANGED).pipe(
        debounceTime(5),
        map(({ event, payload }) => payload),
        flatMap(renderSvg),
        catchError(err => ({ errors: err.message }))
      ),
      result => {
        this.webContents.send(RENDER_RESULT, result);
      }
    );
  };

  handleWindowLoad = () => {
    this.webContents.setZoomFactor(1);
    this.webContents.setVisualZoomLevelLimits(1, 1);
    this.webContents.setLayoutZoomLevelLimits(0, 0);
  };

  handleWindowClosed = () => {
    this.subscriptions.forEach(s => s.unsubscribe());

    this.window = null;
    this.webContents = null;
    this.subscriptions = [];
    this.menu = null;

    this.emit(WINDOW_CLOSED);
  };

  handleMenuEvent(eventName, ...handlers) {
    return this.subscribeTo(
      fromEvent(this.menu, eventName).pipe(
        filter(({ browserWindow }) => browserWindow === this.window)
      ),
      ...handlers
    );
  }

  subscribeTo(observable, handler, errHandler, closeHandler) {
    this.subscriptions.push(
      observable.subscribe(handler, errHandler, closeHandler)
    );
  }

  windowMessages(channel) {
    return fromEvent(ipcMain, channel, (event, payload) => ({
      event,
      payload
    })).pipe(filter(({ event }) => event.sender === this.webContents));
  }
}

export default function createWindowSession(opts) {
  return new WindowSession(opts);
}
