import { Menu } from "electron";
import { EventEmitter } from "events";

import fileMenu from "./file";
import editMenu from "./edit";
import viewMenu from "./view";
import windowMenu from "./window";
import helpMenu from "./help";

function setupMenu() {
  const emitter = new EventEmitter();

  const emit = (eventName, payload) => (menuItem, browserWindow, event) => {
    emitter.emit(eventName, { menuItem, browserWindow, event, payload });
  };

  const menu = Menu.buildFromTemplate([
    fileMenu(emit),
    editMenu(emit),
    viewMenu(emit),
    windowMenu(emit),
    helpMenu(emit)
  ]);

  Menu.setApplicationMenu(menu);

  return emitter;
}

export default setupMenu;