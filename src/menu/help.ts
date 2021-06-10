import { MenuItemConstructorOptions, shell } from "electron";

export default function helpMenu(): MenuItemConstructorOptions {
  return {
    role: "help",
    submenu: [
      {
        label: "Homepage",
        click() {
          shell.openExternal("https://github.com/apoco/dot-editor");
        }
      }
    ]
  };
}
