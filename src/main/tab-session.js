import { fromEvent } from "rxjs";
import {
  catchError,
  debounceTime,
  filter,
  flatMap,
  map,
  tap
} from "rxjs/operators";
import { dialog, ipcMain } from "electron";

import SessionManager from "./session-manager";
import renderSvg from "./render-svg";
import writeFile from "./fs/write-file";
import {
  NEW_TAB,
  RENDER_RESULT,
  SAVE_COMPLETED,
  SOURCE_CHANGED
} from "../constants/messages";
import showSaveDialog from "./dialogs/save";

class TabSession extends SessionManager {
  webContents = null;

  code = "";
  svg = "";
  errors = "";
  filename = null;
  isDirty = false;
  isActive = false;

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
        tap(({ code }) => {
          this.isDirty = true;
          this.code = code;
        }),
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

  setIsActive(isActive) {
    this.isActive = isActive;
  }

  async save() {
    try {
      if (!this.filename) {
        const selectedFile = await showSaveDialog("Save As");
        if (!selectedFile) {
          return;
        }

        this.filename = selectedFile;
      }

      await writeFile(this.filename, this.code);
      this.isDirty = false;
      return this.sendTabEvent(SAVE_COMPLETED, {
        filename: this.filename,
        tabId: this.id
      });
    } catch (err) {
      dialog.showErrorBox("Error saving", `Could not save file.\n${err.stack}`);
    }
  }

  dispose() {
    super.dispose();
  }
}

function createTabSession(opts) {
  return new TabSession(opts);
}

export default createTabSession;
