import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

export default function editMenu(): MenuItemConstructorOptions {
  return {
    label: "Edit",
    accelerator: "Alt+E",
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
  };
}
