import createMenu from "../menu/index";
import SessionManager from "./session-manager";
import showOpenDialog from "../dialogs/open";
import WindowSession from "./window-session";
import { MenuEvent } from "../events/menu-events";
import EventEmitter = NodeJS.EventEmitter;
import BrowserWindow = Electron.BrowserWindow;
import { WINDOW_CLOSED } from "../events/server-events";

class AppSession extends SessionManager {
  menu: EventEmitter;
  windowSessions: { [sessionId: string]: WindowSession } = {};

  constructor() {
    super();

    this.menu = createMenu();
    this.openWindow();

    this.subscribeToMenuEvent(MenuEvent.NewWindow, this.openWindow);
    this.subscribeToMenuEvent(MenuEvent.OpenFile, this.showOpenDialog);
  }

  openWindow = () => {
    const windowSession = new WindowSession({ menu: this.menu });
    this.windowSessions[windowSession.id] = windowSession;

    this.subscribeToEvent(windowSession, WINDOW_CLOSED, () =>
      this.handleWindowClosed(windowSession)
    );

    return windowSession;
  };

  showOpenDialog = async ({
    browserWindow
  }: {
    browserWindow: BrowserWindow;
  }) => {
    const filename = await showOpenDialog();
    if (!filename) {
      return;
    }

    const windowSessions = Object.values(this.windowSessions);
    const target =
      windowSessions.find(w => w.hasFileOpen(filename)) ||
      windowSessions.find(w => w.window === browserWindow) ||
      this.openWindow();

    await target.openFile(filename);
    target.window.focus();
  };

  handleWindowClosed(windowSession: WindowSession) {
    delete this.windowSessions[windowSession.id];
  }

  subscribeToMenuEvent(
    eventName: MenuEvent,
    handler: (event: { browserWindow: BrowserWindow }) => void
  ) {
    return this.subscribeToEvent(this.menu, eventName, handler);
  }
}

export default function startAppSession() {
  return new AppSession();
}
