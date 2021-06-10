import { dialog } from "electron";
import filters from "./file-filters";

export default async function showSaveDialog(title: string) {
  const { filePath } = await dialog.showSaveDialog({ title, filters });
  return filePath;
}
