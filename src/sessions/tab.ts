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
import renderSvg from "../utils/render-svg";
import readFile from "../fs/read-file";
import writeFile from "../fs/write-file";
import {
  CLOSE_TAB,
  NEW_TAB,
  OPEN_FILE,
  RENDER_RESULT,
  SAVE_COMPLETED,
  SET_ACTIVE_TAB,
  SOURCE_CHANGED
} from "../constants/messages";
import showSaveDialog from "../dialogs/save";
import unsavedChangesPrompt from "../dialogs/unsaved-changes";
import { CANCEL, YES } from "../dialogs/buttons";
import BrowserWindow = Electron.BrowserWindow;
import WebContents = Electron.WebContents;

type TabSessionOpts = {
  windowId: string;
  window: BrowserWindow;
};

export default class TabSession extends SessionManager {
  window: BrowserWindow = null;
  windowId: string = null;
  webContents: WebContents = null;

  code = "";
  svg = "";
  errors = "";
  filename: string = null;
  isDirty = false;
  isActive = false;

  constructor({ windowId, window }: TabSessionOpts) {
    super();

    this.window = window;
    this.windowId = windowId;
    this.webContents = window.webContents;

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
        catchError(err => [{ errors: err.message }])
      ),
      result => this.sendTabEvent(RENDER_RESULT, result)
    );
  }

  tabEvents(eventName: string) {
    return fromEvent(ipcMain, eventName).pipe(
      map(([e, payload]) => payload),
      filter(({ tabId }) => tabId === this.id)
    );
  }

  sendTabEvent<T extends object>(eventName: string, payload?: T) {
    return this.webContents.send(
      eventName,
      Object.assign({}, payload, {
        tabId: this.id,
        windowId: this.windowId
      })
    );
  }

  setIsActive(isActive: boolean) {
    this.isActive = isActive;

    if (isActive) {
      this.sendTabEvent(SET_ACTIVE_TAB);
    }
  }

  async open(filename: string) {
    this.filename = filename;
    this.code = await readFile(filename, "utf8");
    this.isDirty = false;

    const { svg, errors } = await renderSvg({ code: this.code });
    this.svg = svg;
    this.errors = errors;

    this.sendTabEvent(OPEN_FILE, {
      filename,
      code: this.code,
      svg,
      errors
    });
  }

  async save() {
    try {
      if (!this.filename) {
        const selectedFile = await showSaveDialog("Save As");
        if (!selectedFile) {
          return false;
        }

        this.filename = selectedFile;
      }

      await writeFile(this.filename, this.code);
      this.isDirty = false;
      await this.sendTabEvent(SAVE_COMPLETED, { filename: this.filename });
      return true;
    } catch (err) {
      dialog.showErrorBox("Error saving", `Could not save file.\n${err.stack}`);
      return false;
    }
  }

  async close() {
    if (this.isDirty) {
      const selection = await unsavedChangesPrompt();
      if (selection === CANCEL) {
        return false;
      } else if (selection === YES) {
        const saved = await this.save();
        if (!saved) {
          return false;
        }
      }
    }

    await this.sendTabEvent(CLOSE_TAB);
    this.emit(CLOSE_TAB);
    this.dispose();
    return true;
  }
}
