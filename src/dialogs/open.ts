import { dialog } from "electron";
import filters from "./file-filters";

export default async function showOpenDialog() {
  const { filePaths } = await dialog.showOpenDialog({
    title: "Open",
    filters,
    properties: ["openFile"]
  });
  return filePaths && filePaths[0];
}
