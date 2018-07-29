import { filter } from "rxjs/operators";
import { BrowserWindow, ipcMain } from "electron";

import {
  CLOSE_TAB,
  DECREASE_FONT,
  INCREASE_FONT,
  NEW_TAB,
  SAVE_BUFFER,
  SET_ACTIVE_TAB,
  WINDOW_CLOSED,
  WINDOW_READY
} from "../constants/messages";
import SessionManager from "./session-manager";
import TabSession from "./tab";
import EventEmitter = NodeJS.EventEmitter;
import WebContents = Electron.WebContents;
import { Subscription } from "rxjs";

type WindowSessionOpts = {
  menu: EventEmitter;
};

class WindowSession extends SessionManager {
  menu: EventEmitter = null;
  window: BrowserWindow = null;
  windowId: string = null;
  webContents: WebContents = null;
  tabSessions: { [sessionId: string]: TabSession } = {};
  tabSubscriptions: { [sessionId: string]: Array<Subscription> } = {};

  constructor({ menu }: WindowSessionOpts) {
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

    this.subscribeToEvent(this.window, "close", this.closeAllTabs);
    this.subscribeToEvent(this.window, "closed", this.dispose.bind(this));

    this.setupMenuListeners();

    this.window.loadFile("./src/index.html");
  }

  setupMenuListeners() {
    this.handleMenuEvent(NEW_TAB, this.openTab);
    this.handleMenuEvent(CLOSE_TAB, this.closeTab);

    this.handleMenuEvent(SAVE_BUFFER, this.saveActiveBuffer);

    this.handleMenuEvent(INCREASE_FONT, () =>
      this.webContents.send(INCREASE_FONT)
    );
    this.handleMenuEvent(DECREASE_FONT, () =>
      this.webContents.send(DECREASE_FONT)
    );
  }

  openTab = () => {
    const tabSession = new TabSession({
      window: this.window,
      windowId: this.windowId
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
    return this.activeTabSession.close();
  };

  handleTabClosed = (tabId: string) => {
    this.tabSubscriptions[tabId].forEach(s => s.unsubscribe());
    delete this.tabSessions[tabId];
    delete this.tabSubscriptions[tabId];
  };

  setActiveTab = (tabId: string) => {
    Object.entries(this.tabSessions).forEach(([id, session]) => {
      session.setIsActive(tabId === id);
    });
  };

  async openFile(filename: string) {
    const existingTab = Object.values(this.tabSessions).find(
      t => t.filename === filename
    );

    if (existingTab) {
      this.setActiveTab(existingTab.id);
    } else {
      const activeTab = this.activeTabSession;
      const targetTab =
        activeTab.filename || activeTab.isDirty ? this.openTab() : activeTab;
      await targetTab.open(filename);
    }
  }

  saveActiveBuffer = () => {
    return this.activeTabSession.save();
  };

  closeAllTabs = async ({ event }: { event: Event }) => {
    if (!Object.values(this.tabSessions).length) {
      return; // Close normally
    }

    event.preventDefault();

    for (let tab of Object.values(this.tabSessions)) {
      const closed = await tab.close();
      if (!closed) {
        return;
      }
    }
  };

  get activeTabSession(): TabSession {
    return Object.values(this.tabSessions).find(s => s.isActive);
  }

  hasFileOpen(filename: string) {
    return Object.values(this.tabSessions).some(t => t.filename === filename);
  }

  handleMenuEvent<T>(eventName: string, handler: (event: T) => void) {
    return this.subscribeTo(
      this.eventsFrom(this.menu, eventName).pipe(
        filter(({ browserWindow }) => browserWindow === this.window)
      ),
      handler
    );
  }

  handleIPCEvent<T>(eventName: string, handler: (event: T) => void) {
    return this.subscribeTo(
      this.eventsFrom(ipcMain, eventName).pipe(
        filter(({ event }) => event.sender === this.webContents)
      ),
      handler
    );
  }

  dispose() {
    super.dispose();

    this.window = null;
    this.webContents = null;
    this.menu = null;

    Object.values(this.tabSessions).forEach(s => s.dispose());
    this.tabSessions = {};

    this.emit(WINDOW_CLOSED);
  }
}

export default WindowSession;
