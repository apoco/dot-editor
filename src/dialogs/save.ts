import { dialog } from "electron";
import filters from "./file-filters";

export default function showSaveDialog(title) {
  return new Promise(resolve => {
    return dialog.showSaveDialog({ title, filters }, resolve);
  });
}
