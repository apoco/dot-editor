import createMenu from "./menu";
import createWindowSession from "./window-session";
import {
  INCREASE_FONT,
  NEW_WINDOW,
  WINDOW_CLOSED
} from "../constants/messages";

class AppSession {
  menu = null;
  windowSessions = {};

  constructor() {
    this.menu = createMenu();
    this.openWindow();

    this.menu.on(NEW_WINDOW, this.openWindow);
  }

  openWindow = () => {
    const windowSession = createWindowSession({ menu: this.menu });
    this.windowSessions[windowSession.id] = windowSession;

    windowSession.once(WINDOW_CLOSED, () =>
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
