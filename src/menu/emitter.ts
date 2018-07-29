import MenuItem = Electron.MenuItem;
import BrowserWindow = Electron.BrowserWindow;

type Emitter = (eventName: string, payload?: any) =>
  (menuItem: MenuItem, window: BrowserWindow, event: Event) => void;

export default Emitter;
