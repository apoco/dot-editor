import { fromEvent } from "rxjs";
import { filter } from "rxjs/operators";
import { BrowserWindow, ipcMain } from "electron";

import {
  DECREASE_FONT,
  INCREASE_FONT,
  NEW_TAB,
  SAVE_BUFFER,
  SET_ACTIVE_TAB,
  WINDOW_CLOSED,
  WINDOW_READY
} from "../../constants/messages";
import SessionManager from "./session-manager";
import createTabSession from "./tab";

class WindowSession extends SessionManager {
  window = null;
  webContents = null;
  tabSessions = {};

  constructor({ menu }) {
    super();

    this.menu = menu;
    this.window = new BrowserWindow({ width: 800, height: 600 });
    this.webContents = this.window.webContents;

    this.subscribeToEvent(this.webContents, "did-finish-load", () => {
      this.webContents.setZoomFactor(1);
      this.webContents.setVisualZoomLevelLimits(1, 1);
      this.webContents.setLayoutZoomLevelLimits(0, 0);
    });

    this.handleIPCEvent(WINDOW_READY, ({ windowId }) => {
      this.windowId = windowId;
      this.openTab();
    });

    this.handleIPCEvent(SET_ACTIVE_TAB, ({ windowId, tabId }) =>
        windowId === this.windowId && this.setActiveTab(tabId)
    );

    this.subscribeToEvent(this.window, "closed", this.dispose);

    this.setupMenuListeners();

    this.window.loadFile("lib/ui/index.html");
  }

  setupMenuListeners() {
    this.handleMenuEvent(INCREASE_FONT, () =>
      this.webContents.send(INCREASE_FONT)
    );
    this.handleMenuEvent(DECREASE_FONT, () =>
      this.webContents.send(DECREASE_FONT)
    );
    this.handleMenuEvent(NEW_TAB, this.openTab);
    this.handleMenuEvent(SAVE_BUFFER, this.saveActiveBuffer);
  }

  openTab = () => {
    console.log('Got new tab event for window', this.windowId);
    const tabSession = createTabSession({
      windowId: this.windowId,
      webContents: this.webContents
    });
    this.tabSessions[tabSession.id] = tabSession;
    this.setActiveTab(tabSession.id);
  };

  setActiveTab = tabId => {
    Object.entries(this.tabSessions).forEach(([id, session]) => {
      session.setIsActive(tabId === id);
    });
  };

  saveActiveBuffer = () => {
    Object.values(this.tabSessions)
      .find(s => s.isActive)
      .save();
  };

  handleMenuEvent(eventName, ...handlers) {
    return this.subscribeTo(
      fromEvent(this.menu, eventName).pipe(
        filter(({ browserWindow }) => browserWindow === this.window)
      ),
      ...handlers
    );
  }

  handleIPCEvent(eventName, ...handlers) {
    return this.subscribeTo(
      this.eventsFrom(ipcMain, eventName).pipe(
        filter(({ event }) => event.sender === this.webContents)
      ),
      ...handlers
    );
  }

  dispose = () => {
    super.dispose();

    this.window = null;
    this.webContents = null;
    this.menu = null;

    Object.values(this.tabSessions).forEach(s => s.dispose());
    this.tabSessions = {};

    this.emit(WINDOW_CLOSED);
  };
}

export default function createWindowSession(opts) {
  return new WindowSession(opts);
}
