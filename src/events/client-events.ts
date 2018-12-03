import { TabEvent } from "./tab-events";
import { WindowEvent } from "./window-events";

export const WINDOW_READY = 'WINDOW_READY';
export const SOURCE_CHANGED = 'SOURCE_CHANGED';
export const TAB_SELECTED = 'TAB_SELECTED';

export type ClientWindowEvents = {
  [WINDOW_READY]: {},
  [TAB_SELECTED]: { tabId: string }
};

export type ClientTabEvents = {
  [SOURCE_CHANGED]: { code: string }
};

export type ClientEvents = {
  [K in keyof ClientWindowEvents]: WindowEvent & ClientWindowEvents[K]
} & {
  [K in keyof ClientTabEvents]: TabEvent & ClientTabEvents[K]
};
