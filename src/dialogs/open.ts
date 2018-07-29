import { dialog } from "electron";
import filters from "./file-filters";

export default function showOpenDialog() {
  return new Promise<string>(resolve => {
    return dialog.showOpenDialog(
      {
        title: "Open",
        filters,
        properties: ["openFile"]
      },
      filePaths => resolve(filePaths && filePaths[0])
    );
  });
}
