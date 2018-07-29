import { OPEN_FILE, SAVE_BUFFER, SAVE_DOT_FILE } from "../constants/messages";
import showSaveDialog from "../dialogs/save";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import Emitter from "./emitter";
import MenuItem = Electron.MenuItem;
import BrowserWindow = Electron.BrowserWindow;

function fileMenu(emit: Emitter): MenuItemConstructorOptions {
  return {
    label: "File",
    submenu: [
      {
        label: "Open...",
        accelerator: "CmdOrCtrl+O",
        click: emit(OPEN_FILE)
      },
      {
        label: "Save",
        accelerator: "CmdOrCtrl+S",
        click: emit(SAVE_BUFFER)
      },
      {
        label: "Save As...",
        accelerator: "CmdOrCtrl+Shift+S",
        click: async (
          menuItem: MenuItem,
          window: BrowserWindow,
          event: Event
        ) => {
          const filename = await showSaveDialog("Save As");
          filename &&
            emit(SAVE_DOT_FILE, { filename })(menuItem, window, event);
        }
      },
      { type: "separator" },
      { role: "quit" }
    ]
  };
}

export default fileMenu;
