import * as React from "react";
const { ipcRenderer } = require("electron");

import { RENDER_RESULT, SOURCE_CHANGED } from "../../constants/messages";
import Editor from "./editor";
import prefs from "../../prefs";

const lineNumRegex = /\bline (\d+)/;
const EDITOR_WIDTH_PREF = "layouts.horizontal.editorWidth";

class AppComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      code: "",
      svg: "",
      errors: "",
      editorWidth: prefs.get(EDITOR_WIDTH_PREF, 500),
      resizeDelta: 0
    };

    this.isResizing = false;
    this.resizePointer = null;
    this.resizeStart = null;
  }

  componentDidMount() {
    ipcRenderer.on(RENDER_RESULT, (e, { svg, errors }) => {
      this.setState(svg ? { svg, errors } : { errors });
    });
  }

  handleChange = code => {
    ipcRenderer.send(SOURCE_CHANGED, code);
    this.setState({ code });
  };

  handleSplitterGrab = e => {
    this.isResizing = true;
    this.resizeStart = e.screenX;
    this.resizePointer = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  handleSplitterMove = e => {
    if (!this.isResizing) {
      return;
    }

    this.setState({
      resizeDelta: e.screenX - this.resizeStart
    });
  };

  handleSplitterRelease = e => {
    e.currentTarget.releasePointerCapture(this.resizePointer);

    this.isResizing = false;
    const newWidth = this.state.editorWidth + e.screenX - this.resizeStart;

    this.setState({
      editorWidth: newWidth,
      resizeDelta: 0
    });

    prefs.set(EDITOR_WIDTH_PREF, newWidth);
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
    const { code, svg, editorWidth, resizeDelta } = this.state;

    return (
      <div
        id="app"
        style={{
          gridTemplateColumns: `${editorWidth + resizeDelta}px 1px auto`
        }}
      >
        <Editor
          value={code}
          annotations={this.parseErrors()}
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
        <div id="diagram" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    );
  }
}

export default AppComponent;
