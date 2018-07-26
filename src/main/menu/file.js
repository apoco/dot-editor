import { SAVE_BUFFER, SAVE_DOT_FILE } from "../../constants/messages";
import showSaveDialog from '../dialogs/save';

function fileMenu(emit) {
  return {
    label: "File",
    submenu: [
      {
        label: "Save",
        accelerator: "CmdOrCtrl+S",
        click: emit(SAVE_BUFFER)
      },
      {
        label: "Save As...",
        accelerator: "CmdOrCtrl+Shift+S",
        click: async (...args) => {
          const filename = await showSaveDialog('Save As');
          filename && emit(SAVE_DOT_FILE, { filename })(...args);
        }
      },
      { type: "separator" },
      { role: "quit" }
    ]
  };
}

export default fileMenu;
