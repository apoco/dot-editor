import * as React from "react";
import { ipcRenderer } from "electron";
import classNames = require("classnames");
import { v4 as uuid } from "uuid";

import {
  NEW_TAB,
  RENDER_RESULT,
  SOURCE_CHANGED,
  WINDOW_READY,
  SET_ACTIVE_TAB,
  SAVE_COMPLETED,
  OPEN_FILE,
  CLOSE_TAB
} from "../constants/messages";
import Editor from "./editor";
import Diagram from "./diagram";
import prefs, { EDITOR_WIDTH } from "../prefs/index";
import IPC from "./ipc";
import TabStrip from "./tab-strip";
import Tab from "../model/tab";
import { Annotation } from "react-ace";
import { PointerEventHandler } from "react";

const lineNumRegex = /\bline (\d+)/;

type Props = {};

type State = {
  activeTabId: string | null;
  tabOrder: Array<string>;
  tabs: {
    [tabId: string]: Tab;
  };
  editorWidth: number;
  resizeDelta: number;
};

class AppComponent extends React.Component<Props, State> {
  windowId: string;
  isResizing: boolean;
  resizePointer: number | null;
  resizeStart: number | null;

  constructor(props: Props) {
    super(props);

    this.state = {
      activeTabId: null,
      tabOrder: [],
      tabs: {},
      editorWidth: prefs.get(EDITOR_WIDTH, 500),
      resizeDelta: 0
    };

    this.windowId = uuid();
    this.isResizing = false;
    this.resizePointer = null;
    this.resizeStart = null;
  }

  componentDidMount() {
    this.sendWindowEvent(WINDOW_READY);
  }

  handleNewTab = (tab: Tab & { windowId: string }) => {
    const { windowId, tabId } = tab;

    if (windowId !== this.windowId) {
      return;
    }

    const { tabs, tabOrder } = this.state;

    this.setState({
      activeTabId: tabId,
      tabOrder: tabOrder.concat(tabId),
      tabs: {
        ...tabs,
        [tabId]: tab
      }
    });
  };

  handleTabActivation = ({
    windowId,
    tabId
  }: {
    windowId: string;
    tabId: string;
  }) => {
    if (windowId !== this.windowId) {
      return;
    }

    const { tabs } = this.state;

    this.setState({
      activeTabId: tabId,
      tabs: Object.values(tabs).reduce(
        (allTabs, tab) =>
          Object.assign(allTabs, {
            [tab.tabId]: {
              ...tab,
              isActive: tab.tabId === tabId
            }
          }),
        {}
      )
    });
  };

  handleCloseTab = ({
    tabId,
    windowId
  }: {
    tabId: string;
    windowId: string;
  }) => {
    if (windowId !== this.windowId) {
      return;
    }

    const { tabs, tabOrder, activeTabId } = this.state;

    const { [tabId]: deletedTab, ...newTabs } = tabs;
    const newTabOrder = tabOrder.filter(item => item !== tabId);
    if (!newTabOrder.length) {
      return void window.close();
    }

    let newActiveTabId = activeTabId;
    if (activeTabId === tabId) {
      const tabIdx = tabOrder.indexOf(tabId);
      const newTabIdx = Math.min(newTabOrder.length - 1, tabIdx);
      newActiveTabId = newTabOrder[newTabIdx];
    }

    this.setState({
      tabs: newTabs,
      tabOrder: newTabOrder,
      activeTabId: newActiveTabId
    });

    this.sendWindowEvent(SET_ACTIVE_TAB, { tabId: newActiveTabId });
  };

  handleOpenFile = ({ tabId, code, filename, svg, errors }: Tab) => {
    const { tabs } = this.state;

    this.setState({
      tabs: {
        ...tabs,
        [tabId]: {
          ...tabs[tabId],
          code,
          filename,
          svg,
          errors,
          isDirty: false
        }
      }
    });
  };

  handleChange = (code: string) => {
    const { tabs, activeTabId } = this.state;
    if (!activeTabId || code === tabs[activeTabId].code) {
      return;
    }

    this.sendTabEvent(SOURCE_CHANGED, { code });

    this.setState({
      tabs: {
        ...tabs,
        [activeTabId]: {
          ...tabs[activeTabId],
          code,
          isDirty: true
        }
      }
    });
  };

  handleRender = ({ tabId, svg, errors }: Tab) => {
    const { tabs } = this.state;

    this.setState({
      tabs: {
        ...tabs,
        [tabId]: {
          ...tabs[tabId],
          ...(svg ? { svg, errors } : { errors })
        }
      }
    });
  };

  handleSaveCompleted = async ({ filename, tabId }: Tab) => {
    const { tabs } = this.state;

    this.setState({
      tabs: {
        ...tabs,
        [tabId]: {
          ...tabs[tabId],
          isDirty: false,
          filename
        }
      }
    });
  };

  handleSplitterGrab: PointerEventHandler = e => {
    e.preventDefault();

    this.isResizing = true;
    this.resizeStart = e.screenX;
    this.resizePointer = e.pointerId;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  handleSplitterMove: PointerEventHandler = e => {
    e.preventDefault();
    if (!this.isResizing || typeof this.resizeStart !== "number") {
      return;
    }

    this.setState({
      resizeDelta: e.screenX - this.resizeStart
    });
  };

  handleSplitterRelease: PointerEventHandler = e => {
    e.preventDefault();
    if (e.currentTarget instanceof Element && this.resizePointer) {
      e.currentTarget.releasePointerCapture(this.resizePointer);
    }

    if (typeof this.resizeStart !== "number") {
      return;
    }

    this.isResizing = false;
    const newWidth = this.state.editorWidth + e.screenX - this.resizeStart;

    this.setState({
      editorWidth: newWidth,
      resizeDelta: 0
    });

    prefs.set(EDITOR_WIDTH, newWidth);
  };

  handleTabSelection = (tabId: string, e: MouseEvent) => {
    e.preventDefault();

    this.setState({
      activeTabId: tabId
    });

    this.sendWindowEvent(SET_ACTIVE_TAB, { tabId });
  };

  parseErrors(errors: string | null): Array<Annotation> {
    if (!errors) {
      return [];
    }

    return errors.split(/\r?\n/).map(err => {
      const lineMatch = lineNumRegex.exec(err);
      const line = lineMatch && parseInt(lineMatch[1]) - 1;
      return { type: "error", row: line || 0, column: 0, text: err };
    });
  }

  sendWindowEvent<T>(eventName: string, payload?: T) {
    return ipcRenderer.send(
      eventName,
      Object.assign({}, payload, { windowId: this.windowId })
    );
  }

  sendTabEvent<T>(eventName: string, payload?: T) {
    return this.sendWindowEvent(
      eventName,
      Object.assign({}, payload, {
        tabId: this.state.activeTabId
      })
    );
  }

  renderIPC() {
    return (
      <IPC
        handlers={{
          [NEW_TAB]: this.handleNewTab,
          [OPEN_FILE]: this.handleOpenFile,
          [RENDER_RESULT]: this.handleRender,
          [SAVE_COMPLETED]: this.handleSaveCompleted,
          [CLOSE_TAB]: this.handleCloseTab,
          [SET_ACTIVE_TAB]: this.handleTabActivation
        }}
      />
    );
  }

  renderTabStrip() {
    const { tabs, tabOrder, activeTabId } = this.state;

    return (
      <TabStrip
        tabs={tabOrder.map(id => tabs[id])}
        activeTabId={activeTabId}
        onTabSelected={this.handleTabSelection}
      />
    );
  }

  renderEditors() {
    const { tabs, activeTabId, editorWidth } = this.state;

    return (
      <div id="editors">
        {Object.values(tabs).map(({ tabId, code, errors }) => (
          <Editor
            key={`editor-${tabId}`}
            name={`editor-${tabId}`}
            isActive={tabId === activeTabId}
            value={code}
            annotations={this.parseErrors(errors)}
            width={editorWidth}
            onChange={this.handleChange}
          />
        ))}
      </div>
    );
  }

  renderSplitter() {
    return (
      <div
        id="gripper"
        onPointerDown={this.handleSplitterGrab}
        onPointerMove={this.handleSplitterMove}
        onPointerUp={this.handleSplitterRelease}
      >
        <div id="gripper-handle" />
      </div>
    );
  }

  renderDiagrams() {
    const { tabs, activeTabId } = this.state;

    return (
      <div id="diagrams">
        {Object.values(tabs).map(({ tabId, svg }) => (
          <Diagram
            key={`diagram-${tabId}`}
            className={classNames("diagram", { active: tabId === activeTabId })}
            svg={svg}
          />
        ))}
      </div>
    );
  }

  render() {
    const { editorWidth, resizeDelta } = this.state;
    const effectiveEditorWidth = editorWidth + resizeDelta;

    return (
      <div
        id="app"
        style={{
          gridTemplateColumns: `${effectiveEditorWidth}px 1px auto`
        }}
      >
        {this.renderIPC()}
        {this.renderTabStrip()}
        {this.renderEditors()}
        {this.renderSplitter()}
        {this.renderDiagrams()}
      </div>
    );
  }
}

export default AppComponent;
