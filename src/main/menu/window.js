import { NEW_WINDOW } from "../../constants/messages";

export default function windowMenu(emit) {
  return {
    role: "window",
    submenu: [
      {
        label: 'New Window',
        accelerator: 'CmdOrCtrl+N',
        click: emit(NEW_WINDOW)
      },
      { role: "minimize" }, { role: "close" }
    ]
  };
}
