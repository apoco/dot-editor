import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import Emitter from "./emitter";
import { MenuEvent } from "../events/menu";

function fileMenu(emit: Emitter): MenuItemConstructorOptions {
  return {
    label: "File",
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
      { type: "separator" },
      { role: "quit" }
    ]
  };
}

export default fileMenu;
