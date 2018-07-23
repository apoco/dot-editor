import { fromEvent } from "rxjs";
import { catchError, debounceTime, filter, flatMap, map, tap } from "rxjs/operators";
import { ipcMain } from "electron";
import SessionManager from "./session-manager";
import { NEW_TAB, RENDER_RESULT, SOURCE_CHANGED } from "../constants/messages";
import renderSvg from "./render-svg";

class TabSession extends SessionManager {
  webContents = null;

  code = "";
  svg = "";
  errors = "";
  filename = null;
  isDirty = false;

  constructor({ webContents }) {
    super();

    this.webContents = webContents;

    this.sendTabEvent(NEW_TAB, {
      code: this.code,
      svg: this.svg,
      errors: this.errors,
      filename: this.filename,
      isDirty: this.isDirty
    });

    this.subscribeTo(
      this.tabEvents(SOURCE_CHANGED).pipe(
        debounceTime(5),
        flatMap(renderSvg),
        catchError(err => ({ errors: err.message }))
      ),
      result => this.sendTabEvent(RENDER_RESULT, result)
    );
  }

  tabEvents(eventName) {
    return fromEvent(ipcMain, eventName).pipe(
      map(([e, payload]) => payload),
      filter(({ tabId }) => tabId === this.id)
    );
  }

  handleTabEvent(eventName, ...handlers) {
    return this.subscribeTo(this.tabEvents(eventName), ...handlers);
  }

  sendTabEvent(eventName, payload) {
    return this.webContents.send(eventName, { tabId: this.id, ...payload });
  }

  dispose() {
    super.dispose();
  }
}

function createTabSession(opts) {
  return new TabSession(opts);
}

export default createTabSession;
