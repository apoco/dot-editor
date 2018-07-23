import { shell } from "electron";

export default function helpMenu() {
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
