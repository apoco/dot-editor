import { CLOSE_TAB, NEW_TAB, NEW_WINDOW } from "../constants/messages";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import Emitter from "./emitter";

export default function windowMenu(emit: Emitter): MenuItemConstructorOptions {
  return {
    role: "window",
    submenu: [
      {
        label: 'New Tab',
        accelerator: "CmdOrCtrl+T",
        click: emit(NEW_TAB)
      },
      {
        label: 'Close Tab',
        accelerator: "CmdOrCtrl+W",
        click: emit(CLOSE_TAB)
      },
      { type: 'separator' },
      {
        label: "New Window",
        accelerator: "CmdOrCtrl+N",
        click: emit(NEW_WINDOW)
      },
      { role: "minimize" }
    ]
  };
}
