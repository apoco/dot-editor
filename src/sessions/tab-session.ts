import { fromEvent, Observable } from "rxjs";
import {
  debounceTime,
  filter,
  flatMap,
  map,
  tap
} from "rxjs/operators";
import { dialog, ipcMain } from "electron";

import SessionManager from "./session-manager";
import renderSvg, { RenderResult } from "../utils/render-svg";
import readFile from "../fs/read-file";
import writeFile from "../fs/write-file";
import showSaveDialog from "../dialogs/save";
import unsavedChangesPrompt from "../dialogs/unsaved-changes";
import { CANCEL, YES } from "../dialogs/buttons";
import BrowserWindow = Electron.BrowserWindow;
import WebContents = Electron.WebContents;
import {
  ACTIVE_TAB_SET,
  FILE_OPENED,
  TAB_CREATED,
  RENDER_ATTEMPTED,
  ServerTabEvents,
  FILE_SAVED, TAB_CLOSED
} from "../events/server-events";
import { ClientTabEvents, SOURCE_CHANGED } from "../events/client-events";
import { TabEvent } from "../events/tab-events";
import exportImage from "../utils/export";

type TabSessionOpts = {
  windowId: string;
  window: BrowserWindow;
};

export default class TabSession extends SessionManager {
  window: BrowserWindow;
  windowId: string;
  webContents: WebContents;

  code = "";
  svg: string | null = null;
  errors = "";
  filename: string | null = null;
  isDirty = false;
  isActive = false;

  constructor({ windowId, window }: TabSessionOpts) {
    super();

    this.window = window;
    this.windowId = windowId;
    this.webContents = window.webContents;

    this.sendTabEvent(TAB_CREATED, {
      code: this.code,
      svg: this.svg,
      errors: this.errors,
      filename: this.filename,
      isDirty: this.isDirty
    });

    this.subscribeTo(
      this.tabEvents(SOURCE_CHANGED).pipe(
        tap(({ code }: { code: string }) => {
          this.isDirty = true;
          this.code = code;
        }),
        debounceTime(5),
        flatMap(renderSvg)
      ),
      (result: RenderResult) => this.sendTabEvent(RENDER_ATTEMPTED, result)
    );
  }

  tabEvents<T extends keyof ClientTabEvents>(
    eventName: T
  ): Observable<ClientTabEvents[T]> {
    return fromEvent(ipcMain, eventName).pipe(
      map(([e, payload]: [Event, T]) => payload),
      filter((payload: TabEvent) => payload.tabId === this.id)
    );
  }

  sendTabEvent<T extends keyof ServerTabEvents>(
    eventName: T,
    payload: ServerTabEvents[T]
  ) {
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
      this.sendTabEvent(ACTIVE_TAB_SET, {});
    }
  }

  async open(filename: string) {
    this.filename = filename;
    this.code = await readFile(filename, "utf8");
    this.isDirty = false;

    const { svg, errors } = await renderSvg({ code: this.code });
    this.svg = svg || null;
    this.errors = errors;

    this.sendTabEvent(FILE_OPENED, {
      filename,
      code: this.code,
      svg,
      errors
    });
  }

  async save(): Promise<boolean> {
    try {
      if (!this.filename) {
        return this.saveAs();
      }

      await writeFile(this.filename, this.code);
      this.isDirty = false;
      await this.sendTabEvent(FILE_SAVED, { filename: this.filename });
      return true;
    } catch (err) {
      dialog.showErrorBox("Error saving", `Could not save file.\n${err.stack}`);
      return false;
    }
  }

  async saveAs() {
    const selectedFile = await showSaveDialog("Save As");
    if (!selectedFile) {
      return false;
    }

    this.filename = selectedFile;
    return this.save();
  }

  export({ filename, format }: { filename: string, format: string }) {
    return exportImage({ code: this.code, filename, format });
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

    await this.sendTabEvent(TAB_CLOSED, {});
    this.emit(TAB_CLOSED);
    this.dispose();
    return true;
  }
}
