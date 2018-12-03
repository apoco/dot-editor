import MenuItem = Electron.MenuItem;
import BrowserWindow = Electron.BrowserWindow;
import { MenuEvent } from "../events/menu-events";

type Emitter = (
  eventType: MenuEvent
) => (menuItem: MenuItem, window: BrowserWindow, event: Event) => void;

export default Emitter;
