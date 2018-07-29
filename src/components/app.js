import * as React from "react";
import { ipcRenderer } from "electron";
import classNames from "classnames";
import uuid from "uuid";

import {
  NEW_TAB,
  RENDER_RESULT,
  SOURCE_CHANGED,
  SAVE_DOT_FILE,
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

const lineNumRegex = /\bline (\d+)/;

class AppComponent extends React.Component {
  constructor() {
    super();

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

  handleNewTab = tab => {
    if (tab.windowId !== this.windowId) {
      return;
    }

    const { tabs, tabOrder } = this.state;

    this.setState({
      activeTabId: tab.tabId,
      tabOrder: tabOrder.concat(tab.tabId),
      tabs: {
        ...tabs,
        [tab.tabId]: tab
      }
    });
  };

  handleTabActivation = (e) => {
    const { windowId, tabId } = e;
    console.log('Got tab activation event?!', e);

    if (windowId !== this.windowId) {
      return;
    }

    const { tabs } = this.state;

    this.setState({
      activeTabId: tabId,
      tabs: Object.values(tabs).reduce((allTabs, tab) => Object.assign(allTabs, {
        [tab.tabId]: {
          ...tab,
          isActive: tab.tabId === tabId
        }
      }), {})
    })
  };

  handleCloseTab = ({ tabId, windowId }) => {
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

  handleOpenFile = ({ tabId, code, filename, svg, errors }) => {
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

  handleChange = code => {
    const { tabs, activeTabId } = this.state;
    if (code === tabs[activeTabId].code) {
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

  handleRender = ({ tabId, svg, errors }) => {
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

  handleSaveCompleted = async ({ filename, tabId }) => {
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

  handleSplitterGrab = e => {
    e.preventDefault();

    this.isResizing = true;
    this.resizeStart = e.screenX;
    this.resizePointer = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  handleSplitterMove = e => {
    e.preventDefault();
    if (!this.isResizing) {
      return;
    }

    this.setState({
      resizeDelta: e.screenX - this.resizeStart
    });
  };

  handleSplitterRelease = e => {
    e.preventDefault();
    e.currentTarget.releasePointerCapture(this.resizePointer);

    this.isResizing = false;
    const newWidth = this.state.editorWidth + e.screenX - this.resizeStart;

    this.setState({
      editorWidth: newWidth,
      resizeDelta: 0
    });

    prefs.set(EDITOR_WIDTH, newWidth);
  };

  handleTabSelection = (tabId, e) => {
    console.log('Changing to tab', tabId);

    e.preventDefault();

    this.setState({
      activeTabId: tabId
    });

    this.sendWindowEvent(SET_ACTIVE_TAB, { tabId });
  };

  parseErrors(errors) {
    return (errors || "").split(/\r?\n/).map(err => {
      const lineMatch = lineNumRegex.exec(err);
      const line = lineMatch && parseInt(lineMatch[1]);
      return { type: "error", row: line - 1, text: err };
    });
  }

  sendWindowEvent(eventName, payload) {
    return ipcRenderer.send(eventName, { windowId: this.windowId, ...payload });
  }

  sendTabEvent(eventName, payload) {
    return this.sendWindowEvent(eventName, {
      tabId: this.state.activeTabId,
      ...payload
    });
  }

  renderIPC() {
    return (
      <IPC
        {...{
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
    const { tabs, activeTabId, fontSize, editorWidth } = this.state;

    return (
      <div id="editors">
        {Object.values(tabs).map(({ tabId, code, errors }) => (
          <Editor
            key={`editor-${tabId}`}
            name={`editor-${tabId}`}
            isActive={tabId === activeTabId}
            value={code}
            annotations={this.parseErrors(errors)}
            fontSize={fontSize}
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
