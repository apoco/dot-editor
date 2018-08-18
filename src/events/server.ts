import Tab from "../model/tab";
import { TabEvent } from "./tab";
import { RenderResult } from "../utils/render-svg";
import { WindowEvent } from "./window";

export const FILE_OPENED = "FILE_OPENED";
export const TAB_CREATED = "TAB_CREATED";
export const ACTIVE_TAB_SET = "ACTIVE_TAB_SET";
export const TAB_CLOSED = "TAB_CLOSED";
export const RENDER_ATTEMPTED = "RENDER_ATTEMPTED";
export const FILE_SAVED = "FILE_SAVED";
export const WINDOW_CLOSED = "WINDOW_CLOSED";
export const INCREASE_FONT = "INCREASE_FONT";
export const DECREASE_FONT = "DECREASE_FONT";

export type ServerWindowEvents = {
  [WINDOW_CLOSED]: {};
  [INCREASE_FONT]: {};
  [DECREASE_FONT]: {};
};

export type ServerTabEvents = {
  [TAB_CREATED]: Pick<Tab, "filename" | "code" | "svg" | "errors" | "isDirty">;
  [TAB_CLOSED]: {};
  [ACTIVE_TAB_SET]: {};
  [RENDER_ATTEMPTED]: RenderResult;
  [FILE_OPENED]: {
    filename: string;
    code: string;
    svg: string | null;
    errors: string | null;
  };
  [FILE_SAVED]: {
    filename: string;
  };
};

export type ServerEvents = {
  [K in keyof ServerWindowEvents]: WindowEvent & ServerWindowEvents[K]
} &
  { [K in keyof ServerTabEvents]: TabEvent & ServerTabEvents[K] };
