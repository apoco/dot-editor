import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import Emitter from "./emitter";
import { MenuEvent } from "../events/menu-events";

function fileMenu(emit: Emitter): MenuItemConstructorOptions {
  return {
    label: "File",
    accelerator: "Alt+F",
    submenu: [
      {
        label: "Open...",
        accelerator: "CmdOrCtrl+O",
        click: emit(MenuEvent.OpenFile)
      },
      {
        label: "Save",
        accelerator: "CmdOrCtrl+S",
        click: emit(MenuEvent.SaveFile)
      },
      {
        label: "Save As...",
        accelerator: "CmdOrCtrl+Shift+S",
        click: emit(MenuEvent.SaveFileAs)
      },
      {
        label: 'Export As...',
        accelerator: 'CmdOrCtrl+E',
        click: emit(MenuEvent.Export)
      },
      { type: "separator" },
      { role: "quit" }
    ]
  };
}

export default fileMenu;
