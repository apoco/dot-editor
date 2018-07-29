import createMenu from "../menu/index";
import createWindowSession from "./window";
import SessionManager from "./session-manager";
import { NEW_WINDOW, OPEN_FILE, WINDOW_CLOSED } from "../constants/messages";
import showOpenDialog from "../dialogs/open";
import WindowSession from "./window";

class AppSession extends SessionManager {
  menu = null;
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

  showOpenDialog = async ({ browserWindow }) => {
    const filename = await showOpenDialog();
    if (!filename) {
      return;
    }

    const windowSessions = Object.values(this.windowSessions);
    const target = windowSessions.find(w => w.hasFileOpen(filename))
       || windowSessions.find(w => w.window === browserWindow)
       || this.openWindow();

    await target.openFile(filename);
    target.window.focus();
  };

  handleWindowClosed(windowSession) {
    delete this.windowSessions[windowSession.id];
  }

  subscribeToMenuEvent(eventName, ...handlers) {
    return this.subscribeToEvent(this.menu, eventName, ...handlers);
  }
}

export default function startAppSession() {
  return new AppSession();
}
