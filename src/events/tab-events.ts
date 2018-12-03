import { WindowEvent } from "./window-events";

export type TabEvent = WindowEvent & { tabId: string };
