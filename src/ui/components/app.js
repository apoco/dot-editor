import * as React from "react";
import { ipcRenderer } from "electron";
import classNames from "classnames";
import uuid from 'uuid';

import {
  NEW_TAB,
  RENDER_RESULT,
  SOURCE_CHANGED,
  SAVE_DOT_FILE,
  WINDOW_READY, SET_ACTIVE_TAB, SAVE_COMPLETED, OPEN_FILE
} from "../../constants/messages";
import Editor from "./editor";
import Diagram from "./diagram";
import prefs, { EDITOR_WIDTH } from "../../prefs";
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
    ipcRenderer.send(WINDOW_READY, { windowId: this.windowId });
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

    ipcRenderer.send(SOURCE_CHANGED, { tabId: activeTabId, code });

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
    e.preventDefault();

    this.setState({
      activeTabId: tabId
    });

    ipcRenderer.send(SET_ACTIVE_TAB, { tabId });
  };

  parseErrors(errors) {
    return (errors || "").split(/\r?\n/).map(err => {
      const lineMatch = lineNumRegex.exec(err);
      const line = lineMatch && parseInt(lineMatch[1]);
      return { type: "error", row: line - 1, text: err };
    });
  }

  renderIPC() {
    return (
      <IPC
        {...{
          [NEW_TAB]: this.handleNewTab,
          [OPEN_FILE]: this.handleOpenFile,
          [RENDER_RESULT]: this.handleRender,
          [SAVE_DOT_FILE]: this.handleSave,
          [SAVE_COMPLETED]: this.handleSaveCompleted
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
