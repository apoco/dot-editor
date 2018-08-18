import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import Emitter from "./emitter";
import { MenuEvent } from "../events/menu";

export default function viewMenu(emit: Emitter): MenuItemConstructorOptions {
  return {
    label: "View",
    submenu: [
      {
        label: "Increase Font Size",
        accelerator: "CmdOrCtrl+Plus",
        click: emit(MenuEvent.IncreaseFont)
      },
      {
        label: "Decrease Font Size",
        accelerator: "CmdOrCtrl+-",
        click: emit(MenuEvent.DecreaseFont)
      },
      { type: "separator" },
      { role: "forceReload" },
      { role: "toggledevtools" }
    ]
  };
}
