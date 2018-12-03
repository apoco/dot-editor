import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { BrowserWindow, ipcMain } from "electron";

import SessionManager from "./session-manager";
import TabSession from "./tab-session";
import {
  ClientEvents,
  TAB_SELECTED,
  WINDOW_READY
} from "../events/client-events";
import {
  DECREASE_FONT,
  INCREASE_FONT,
  ServerWindowEvents,
  TAB_CLOSED,
  WINDOW_CLOSED
} from "../events/server-events";
import { MenuEvent } from "../events/menu-events";
import EventEmitter = NodeJS.EventEmitter;
import WebContents = Electron.WebContents;
import ExportDialogSession from "./export-session";
import { EXPORT } from "../events/export-events";

type WindowSessionOpts = {
  menu: EventEmitter;
};

class WindowSession extends SessionManager {
  menu: EventEmitter;
  window: BrowserWindow;
  webContents: WebContents;
  windowId: string | null = null;
  tabSessions: { [sessionId: string]: TabSession } = {};
  tabSubscriptions: { [sessionId: string]: Array<Subscription> } = {};
  exportSession: ExportDialogSession | null = null;

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

    this.handleClientEvent(
      WINDOW_READY,
      ({ windowId }: { windowId: string }) => {
        this.windowId = windowId;
        this.openTab();
      }
    );

    this.handleClientEvent(
      TAB_SELECTED,
      ({ windowId, tabId }: { windowId: string; tabId: string }) =>
        windowId === this.windowId && this.setActiveTab(tabId)
    );

    this.subscribeToEvent(this.window, "close", this.closeAllTabs);
    this.subscribeToEvent(this.window, "closed", this.dispose.bind(this));

    this.setupMenuListeners();

    this.window.loadFile("./src/index.html");
  }

  setupMenuListeners() {
    this.handleMenuEvent(MenuEvent.NewTab, this.openTab);
    this.handleMenuEvent(MenuEvent.CloseTab, this.closeTab);

    this.handleMenuEvent(MenuEvent.SaveFile, this.saveActiveBuffer);
    this.handleMenuEvent(MenuEvent.SaveFileAs, this.saveActiveBufferAs);

    this.handleMenuEvent(MenuEvent.Export, this.openExportDialog);

    this.handleMenuEvent(MenuEvent.IncreaseFont, () =>
      this.sendEvent(INCREASE_FONT, {})
    );
    this.handleMenuEvent(MenuEvent.DecreaseFont, () =>
      this.sendEvent(DECREASE_FONT, {})
    );
  }

  openTab = () => {
    if (!this.windowId) {
      throw new Error("Window is not properly initialized");
    }

    const tabSession = new TabSession({
      window: this.window,
      windowId: this.windowId
    });
    this.tabSessions[tabSession.id] = tabSession;
    this.setActiveTab(tabSession.id);

    this.tabSubscriptions[tabSession.id] = [
      this.subscribeToEvent(tabSession, TAB_CLOSED, () =>
        this.handleTabClosed(tabSession.id)
      )
    ];

    return tabSession;
  };

  closeTab = () => {
    const activeTab = this.activeTabSession;
    return activeTab && activeTab.close();
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
        !activeTab || activeTab.filename || activeTab.isDirty
          ? this.openTab()
          : activeTab;
      await targetTab.open(filename);
    }
  }

  saveActiveBuffer = () => {
    const activeTab = this.activeTabSession;
    return activeTab && activeTab.save();
  };

  saveActiveBufferAs = () => {
    const activeTab = this.activeTabSession;
    return activeTab && activeTab.saveAs();
  };

  openExportDialog = () => {
    const tab = this.activeTabSession;
    if (tab && tab.filename) {
      const exportSession = new ExportDialogSession({
        parentWindow: this.window,
        filename: tab.filename
      });
      this.subscribeToEvent(exportSession, EXPORT, this.handleExport);
      this.subscribeToEvent(
        exportSession,
        WINDOW_CLOSED,
        this.handleExportClose
      );
      this.exportSession = exportSession;
    }
  };

  handleExport = async (e: { event: { filename: string; format: string } }) => {
    try {
      if (this.activeTabSession) {
        await this.activeTabSession.export(e.event);
        this.handleExportClose();
      }
    } catch (err) {
      this.exportSession && this.exportSession.showError(err);
    }
  };

  handleExportClose = () => {
    if (this.exportSession) {
      this.exportSession.close();
      this.exportSession = null;
    }
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

  get activeTabSession(): TabSession | null {
    return Object.values(this.tabSessions).find(s => s.isActive) || null;
  }

  hasFileOpen(filename: string) {
    return Object.values(this.tabSessions).some(t => t.filename === filename);
  }

  handleMenuEvent(eventName: MenuEvent, handler: () => void) {
    return this.subscribeTo(
      this.eventsFrom(this.menu, eventName).pipe(
        filter(({ browserWindow }) => browserWindow === this.window)
      ),
      handler
    );
  }

  handleClientEvent<T extends keyof ClientEvents>(
    eventName: T,
    handler: (event: ClientEvents[T]) => void
  ) {
    return this.subscribeTo(
      this.eventsFrom(ipcMain, eventName).pipe(
        filter(({ event }) => event.sender === this.webContents)
      ),
      handler
    );
  }

  sendEvent<T extends keyof ServerWindowEvents>(
    eventName: T,
    payload: ServerWindowEvents[T]
  ) {
    return this.webContents.send(
      eventName,
      Object.assign({}, payload, { windowId: this.id })
    );
  }

  dispose() {
    super.dispose();

    Object.values(this.tabSessions).forEach(s => s.dispose());
    this.tabSessions = {};

    this.emit(WINDOW_CLOSED);
  }
}

export default WindowSession;
