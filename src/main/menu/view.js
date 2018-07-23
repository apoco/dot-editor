import { DECREASE_FONT, INCREASE_FONT } from "../../constants/messages";

export default function viewMenu(emit) {
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
      { role: "toggledevtools" }
    ]
  };
}
