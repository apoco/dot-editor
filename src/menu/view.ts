import { DECREASE_FONT, INCREASE_FONT } from "../constants/messages";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

export default function viewMenu(emit): MenuItemConstructorOptions {
  return {
    label: "View",
    submenu: [
      {
        label: "Increase Font Size",
        accelerator: "CmdOrCtrl+Plus",
        click: emit(INCREASE_FONT)
      },
      {
        label: "Decrease Font Size",
        accelerator: "CmdOrCtrl+-",
        click: emit(DECREASE_FONT)
      },
      { type: "separator" },
      { role: "forceReload" },
      { role: "toggledevtools" }
    ]
  };
}
