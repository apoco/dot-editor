import { promisify } from "util";
import fs from "fs";
import * as React from "react";
import { dialog, ipcRenderer } from "electron";

import {
  RENDER_RESULT,
  SAVE_DOT_FILE,
  SOURCE_CHANGED
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
      code: "",
      svg: "",
      errors: "",
      editorWidth: prefs.get(EDITOR_WIDTH, 500),
      resizeDelta: 0,
      filename: "",
      isDirty: false
    };

    this.isResizing = false;
    this.resizePointer = null;
    this.resizeStart = null;
  }

  handleChange = code => {
    ipcRenderer.send(SOURCE_CHANGED, code);
    this.setState({ code, isDirty: true });
  };

  handleRender = (e, { svg, errors }) => {
    this.setState(svg ? { svg, errors } : { errors });
  };

  handleSave = async (e, filename) => {
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

  parseErrors() {
    const { errors } = this.state;

    return errors.split(/\r?\n/).map(err => {
      const lineMatch = lineNumRegex.exec(err);
      const line = lineMatch && parseInt(lineMatch[1]);
      return { type: "error", row: line - 1, text: err };
    });
  }

  render() {
    const { code, fontSize, svg, editorWidth, resizeDelta } = this.state;
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
            [RENDER_RESULT]: this.handleRender,
            [SAVE_DOT_FILE]: this.handleSave
          }}
        />
        <Editor
          value={code}
          annotations={this.parseErrors()}
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
