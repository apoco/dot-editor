import { Menu } from "electron";
import { EventEmitter } from "events";

import fileMenu from "./file";
import editMenu from "./edit";
import viewMenu from "./view";
import windowMenu from "./window";
import helpMenu from "./help";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import Emitter from "./emitter";

function setupMenu() {
  const emitter = new EventEmitter();

  const emit: Emitter = (eventName, payload) => (
    menuItem,
    browserWindow,
    event
  ) => {
    emitter.emit(eventName, event, { menuItem, browserWindow, ...payload });
  };

  const menu = Menu.buildFromTemplate([
    fileMenu(emit),
    editMenu(),
    viewMenu(emit),
    windowMenu(emit),
    helpMenu()
  ]);

  Menu.setApplicationMenu(menu);

  return emitter;
}

export default setupMenu;
