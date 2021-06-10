import { BrowserWindow, dialog, ipcMain } from "electron";
import { filter } from "rxjs/operators";

import prefs, { EXPORT_EXTENSION, EXPORT_FORMAT } from "../prefs";
import SessionManager from "./session-manager";
import {
  ServerExportEvents,
  SET_EXPORT_DEFAULTS,
  SET_EXPORT_FILENAME,
  WINDOW_CLOSED
} from "../events/server-events";
import {
  ExportDialogEvents,
  EXPORT_FILE_BROWSE,
  EXPORT,
  EXPORT_DIALOG_LOADED
} from "../events/export-events";
import { extname } from "path";

class ExportDialogSession extends SessionManager {
  window: BrowserWindow;
  sourceFilename: string;

  constructor(opts: { parentWindow: BrowserWindow; filename: string }) {
    super();

    this.sourceFilename = opts.filename;
    this.window = new BrowserWindow({
      width: 600,
      height: 250,
      modal: true,
      parent: opts.parentWindow,
      resizable: true
    });

    this.subscribeToEvent(this.window, "closed", this.handleWindowClosed);

    this.window.loadFile(require.resolve("../components/export/export.html"));
    this.window.setMenu(null);

    this.subscribeToExportEvent(EXPORT_DIALOG_LOADED, this.handleDialogLoaded);
    this.subscribeToExportEvent(EXPORT_FILE_BROWSE, this.handleFileBrowse);
    this.subscribeToExportEvent(EXPORT, this.handleExport);
  }

  showError(error: Error) {
    dialog.showMessageBox(this.window, {
      type: "error",
      title: "Error exporting file",
      message: error.stack || "Unknown error"
    });
  }

  close() {
    this.dispose();
    this.window.close();
  }

  handleDialogLoaded = (e: {}) => {
    this.sendEvent(SET_EXPORT_DEFAULTS, {
      sourceFilename: this.sourceFilename,
      extension: prefs.get(EXPORT_EXTENSION, "svg"),
      format: prefs.get(EXPORT_FORMAT, "svg")
    });
  };

  handleFileBrowse = async (e: { filename: string }) => {
    const { filePath } = await dialog.showSaveDialog(this.window, {
      defaultPath: e.filename
    });
    if (filePath) {
      this.sendEvent(SET_EXPORT_FILENAME, { filename: filePath });
    }
  };

  handleExport = (e: { filename: string; format: string }) => {
    prefs.set(EXPORT_EXTENSION, extname(e.filename).replace(".", ""));
    prefs.set(EXPORT_FORMAT, e.format);
    this.emit(EXPORT, e);
  };

  handleWindowClosed = () => {
    this.dispose();
    this.emit(WINDOW_CLOSED);
  };

  subscribeToExportEvent<T extends keyof ExportDialogEvents>(
    eventName: T,
    handler: (event: ExportDialogEvents[T]) => void
  ) {
    return this.subscribeTo(
      this.eventsFrom(ipcMain, eventName).pipe(
        filter(({ event }) => event.sender === this.window.webContents)
      ),
      handler
    );
  }

  sendEvent<T extends keyof ServerExportEvents>(
    eventName: T,
    payload: ServerExportEvents[T]
  ) {
    return this.window.webContents.send(eventName, payload);
  }
}

export default ExportDialogSession;
