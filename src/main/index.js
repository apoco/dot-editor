import { app, BrowserWindow, ipcMain } from "electron";
import { fromEvent } from "rxjs";
import { catchError, flatMap } from "rxjs/operators";

import { RENDER_RESULT, SOURCE_CHANGED } from "../constants/messages";
import createMenu from "./menu";
import renderSvg from "./render-svg";

app.on("ready", () => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile("lib/ui/index.html");

  const contents = win.webContents;

  contents.on("did-finish-load", () => {
    contents.setZoomFactor(1);
    contents.setVisualZoomLevelLimits(1, 1);
    contents.setLayoutZoomLevelLimits(0, 0);
  });

  createMenu(contents);

  fromEvent(ipcMain, SOURCE_CHANGED, (event, code) => code)
    .pipe(
      flatMap(renderSvg),
      catchError(err => ({ errors: err.message }))
    )
    .forEach(result => {
      contents.send(RENDER_RESULT, result);
    })
    .catch(console.error);
});
