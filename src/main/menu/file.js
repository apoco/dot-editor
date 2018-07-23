import { dialog } from "electron";
import { SAVE_DOT_FILE } from "../../constants/messages";

export default function fileMenu(emit) {
  return {
    label: "File",
    submenu: [
      {
        label: "Save As...",
        accelerator: "CmdOrCtrl+Shift+S",
        click: (...args) =>
          dialog.showSaveDialog(
            {
              title: "Save As",
              filters: [
                {
                  name: "DOT files",
                  extensions: ["dot"]
                },
                { name: "All Files", extensions: ["*"] }
              ]
            },
            filename => emit(SAVE_DOT_FILE, { filename })(...args)
          )
      },
      { type: "separator" },
      { role: "quit" }
    ]
  };
}
