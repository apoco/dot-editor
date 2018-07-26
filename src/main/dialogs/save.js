import { dialog } from "electron";

export default function showSaveDialog(title) {
  return new Promise(resolve => {
    return dialog.showSaveDialog(
      {
        title,
        filters: [
          {
            name: "DOT files",
            extensions: ["dot"]
          },
          { name: "All Files", extensions: ["*"] }
        ]
      }, resolve);
  });
}
