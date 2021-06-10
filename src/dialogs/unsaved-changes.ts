import { dialog } from "electron";
import { CANCEL, NO, YES } from "./buttons";

const buttons = [YES, NO, CANCEL];

export default async function unsavedChangesPrompt() {
  const { response } = await dialog.showMessageBox({
    type: 'question',
    title: 'Save Changes?',
    message: 'Would you like to save your changes?',
    buttons: buttons.map(b => b.caption),
    defaultId: 0,
    cancelId: 2,
    normalizeAccessKeys: true
  });

  return buttons[response];
}
