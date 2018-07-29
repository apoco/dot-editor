import createMenu from "../menu/index";
import SessionManager from "./session-manager";
import { NEW_WINDOW, OPEN_FILE, WINDOW_CLOSED } from "../constants/messages";
import showOpenDialog from "../dialogs/open";
import WindowSession from "./window";
import EventEmitter = NodeJS.EventEmitter;
import BrowserWindow = Electron.BrowserWindow;

class AppSession extends SessionManager {
  menu: EventEmitter;
  windowSessions: { [sessionId: string]: WindowSession } = {};

  constructor() {
    super();

    this.menu = createMenu();
    this.openWindow();

    this.subscribeToMenuEvent(NEW_WINDOW, this.openWindow);
    this.subscribeToMenuEvent(OPEN_FILE, this.showOpenDialog);
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

  subscribeToMenuEvent<T>(eventName: string, handler: (event: T) => void) {
    return this.subscribeToEvent(this.menu, eventName, handler);
  }
}

export default function startAppSession() {
  return new AppSession();
}
