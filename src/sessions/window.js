import { fromEvent } from "rxjs";
import { filter } from "rxjs/operators";
import { BrowserWindow, dialog, ipcMain } from "electron";

import {
  CLOSE_TAB,
  DECREASE_FONT,
  INCREASE_FONT,
  NEW_TAB,
  OPEN_FILE,
  SAVE_BUFFER,
  SET_ACTIVE_TAB,
  WINDOW_CLOSED,
  WINDOW_READY
} from "../constants/messages";
import SessionManager from "./session-manager";
import createTabSession from "./tab";
import showOpenDialog from "../dialogs/open";

class WindowSession extends SessionManager {
  window = null;
  webContents = null;
  tabSessions = {};
  tabSubscriptions = {};

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

    this.handleIPCEvent(
      SET_ACTIVE_TAB,
      ({ windowId, tabId }) =>
        windowId === this.windowId && this.setActiveTab(tabId)
    );

    this.subscribeToEvent(this.window, "closed", this.dispose);

    this.setupMenuListeners();

    this.window.loadFile("./lib/index.html");
  }

  setupMenuListeners() {
    this.handleMenuEvent(NEW_TAB, this.openTab);
    this.handleMenuEvent(CLOSE_TAB, this.closeTab);

    this.handleMenuEvent(OPEN_FILE, this.showOpenFileDialog);
    this.handleMenuEvent(SAVE_BUFFER, this.saveActiveBuffer);

    this.handleMenuEvent(INCREASE_FONT, () =>
      this.webContents.send(INCREASE_FONT)
    );
    this.handleMenuEvent(DECREASE_FONT, () =>
      this.webContents.send(DECREASE_FONT)
    );
  }

  openTab = () => {
    const tabSession = createTabSession({
      window: this.window,
      windowId: this.windowId,
      webContents: this.webContents
    });
    this.tabSessions[tabSession.id] = tabSession;
    this.setActiveTab(tabSession.id);

    this.tabSubscriptions[tabSession.id] = [
      this.subscribeToEvent(tabSession, CLOSE_TAB, () =>
        this.handleTabClosed(tabSession.id)
      )
    ];

    return tabSession;
  };

  closeTab = () => {
    this.activeTabSession.close();
  };

  handleTabClosed = tabId => {
    this.tabSubscriptions[tabId].forEach(s => s.unsubscribe());
    delete this.tabSessions[tabId];
    delete this.tabSubscriptions[tabId];
  };

  setActiveTab = tabId => {
    Object.entries(this.tabSessions).forEach(([id, session]) => {
      session.setIsActive(tabId === id);
    });
  };

  showOpenFileDialog = async () => {
    const filename = await showOpenDialog();
    if (!filename) {
      return;
    }

    let tab = this.activeTabSession;
    if (tab.isDirty) tab = this.openTab();

    await tab.open(filename);
  };

  saveActiveBuffer = () => {
    this.activeTabSession.save();
  };

  get activeTabSession() {
    return Object.values(this.tabSessions).find(s => s.isActive);
  }

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
