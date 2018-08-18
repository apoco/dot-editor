import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import Emitter from "./emitter";
import { MenuEvent } from "../events/menu";

export default function windowMenu(emit: Emitter): MenuItemConstructorOptions {
  return {
    role: "window",
    submenu: [
      {
        label: 'New Tab',
        accelerator: "CmdOrCtrl+T",
        click: emit(MenuEvent.NewTab)
      },
      {
        label: 'Close Tab',
        accelerator: "CmdOrCtrl+W",
        click: emit(MenuEvent.CloseTab)
      },
      { type: 'separator' },
      {
        label: "New Window",
        accelerator: "CmdOrCtrl+N",
        click: emit(MenuEvent.NewWindow)
      },
      { role: "minimize" }
    ]
  };
}
