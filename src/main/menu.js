import { Menu, shell } from "electron";
import { DECREASE_FONT, INCREASE_FONT } from "../constants/messages";

function setupMenu(webContents) {
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [{ role: "quit" }]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteandmatchstyle" },
        { role: "delete" },
        { role: "selectall" }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "Increase Font Size",
          accelerator: "CmdOrCtrl+Plus",
          click: () => webContents.send(INCREASE_FONT)
        },
        {
          label: "Decrease Font Size",
          accelerator: "CmdOrCtrl+-",
          click: () => webContents.send(DECREASE_FONT)
        },
        { type: "separator" },
        { role: "toggledevtools" }
      ]
    },
    {
      role: "window",
      submenu: [{ role: "minimize" }, { role: "close" }]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Homepage",
          click() {
            shell.openExternal("https://github.com/apoco/dot-editor");
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  return menu;
}

export default setupMenu;
