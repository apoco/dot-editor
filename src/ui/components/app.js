import { promisify } from "util";
import fs from "fs";
import * as React from "react";
import { dialog, ipcRenderer } from "electron";

import {
  NEW_TAB,
  RENDER_RESULT,
  SOURCE_CHANGED,
  SAVE_DOT_FILE,
  WINDOW_READY
} from "../../constants/messages";
import Editor from "./editor";
import Diagram from "./diagram";
import prefs, { EDITOR_WIDTH } from "../../prefs";
import IPC from "./ipc";

const writeFile = promisify(fs.writeFile);
const lineNumRegex = /\bline (\d+)/;

class AppComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      activeTabId: null,
      tabs: {},
      editorWidth: prefs.get(EDITOR_WIDTH, 500),
      resizeDelta: 0
    };

    this.isResizing = false;
    this.resizePointer = null;
    this.resizeStart = null;
  }

  componentDidMount() {
    ipcRenderer.send(WINDOW_READY, {});
  }

  handleNewTab = tab => {
    this.setState({
      activeTabId: tab.tabId,
      tabs: {
        ...this.state.tabs,
        [tab.id]: tab
      }
    });
  };

  handleChange = code => {
    const { tabs, activeTabId } = this.state;

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

  handleSave = async ({ filename }) => {
    try {
      await writeFile(filename, this.state.code);
      this.setState({
        isDirty: false,
        filename
      });
    } catch (err) {
      dialog.showErrorBox("Save Error", `Unable to save file.\n\n${err.stack}`);
    }
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

  parseErrors(errors) {
    return (errors || "").split(/\r?\n/).map(err => {
      const lineMatch = lineNumRegex.exec(err);
      const line = lineMatch && parseInt(lineMatch[1]);
      return { type: "error", row: line - 1, text: err };
    });
  }

  render() {
    const {
      tabs,
      activeTabId,
      fontSize,
      editorWidth,
      resizeDelta
    } = this.state;
    const { code, svg, errors } = tabs[activeTabId] || {};
    const effectiveEditorWidth = editorWidth + resizeDelta;

    return (
      <div
        id="app"
        style={{
          gridTemplateColumns: `${effectiveEditorWidth}px 1px auto`
        }}
      >
        <IPC
          {...{
            [NEW_TAB]: this.handleNewTab,
            [RENDER_RESULT]: this.handleRender,
            [SAVE_DOT_FILE]: this.handleSave
          }}
        />
        <Editor
          value={code}
          annotations={this.parseErrors(errors)}
          fontSize={fontSize}
          width={editorWidth}
          onChange={this.handleChange}
        />
        <div
          id="gripper"
          onPointerDown={this.handleSplitterGrab}
          onPointerMove={this.handleSplitterMove}
          onPointerUp={this.handleSplitterRelease}
        >
          <div id="gripper-handle" />
        </div>
        <Diagram svg={svg} />
      </div>
    );
  }
}

export default AppComponent;
