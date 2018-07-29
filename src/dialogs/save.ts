import { dialog } from "electron";
import filters from "./file-filters";

export default function showSaveDialog(title: string) {
  return new Promise<string>(resolve => {
    return dialog.showSaveDialog({ title, filters }, resolve);
  });
}
