import createMenu from "./menu";
import createWindowSession from "./window-session";
import SessionManager from "./session-manager";
import { NEW_WINDOW, WINDOW_CLOSED } from "../constants/messages";

class AppSession extends SessionManager {
  menu = null;
  windowSessions = {};

  constructor() {
    super();

    this.menu = createMenu();
    this.openWindow();

    this.subscribeToEvent(this.menu, NEW_WINDOW, this.openWindow);
  }

  openWindow = () => {
    const windowSession = createWindowSession({ menu: this.menu });
    this.windowSessions[windowSession.id] = windowSession;

    this.subscribeToEvent(windowSession, WINDOW_CLOSED, () =>
      this.handleWindowClosed(windowSession)
    );
  };

  handleWindowClosed(windowSession) {
    delete this.windowSessions[windowSession.id];
  }
}

export default function startAppSession() {
  return new AppSession();
}
