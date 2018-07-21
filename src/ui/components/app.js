import * as React from "react";
const { ipcRenderer } = require("electron");

import { RENDER_RESULT, SOURCE_CHANGED } from "../../constants/messages";
import Editor from "./editor";

const lineNumRegex = /\bline (\d+)/;

class AppComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      code: "",
      svg: "",
      errors: ""
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on(RENDER_RESULT, (e, { svg, errors }) => {
      this.setState(svg ? { svg, errors } : { errors });
    });
  }

  handleChange(code) {
    ipcRenderer.send(SOURCE_CHANGED, code);
    this.setState({ code });
  }

  parseErrors() {
    const { errors } = this.state;

    return errors.split(/\r?\n/).map(err => {
      const lineMatch = lineNumRegex.exec(err);
      const line = lineMatch && parseInt(lineMatch[1]);
      return { type: "error", row: line - 1, text: err };
    });
  }

  render() {
    const { code, svg, errors } = this.state;

    return (
      <React.Fragment>
        <Editor
          value={code}
          annotations={this.parseErrors()}
          onChange={this.handleChange}
        />
        <div id="gripper">
          <div id="gripper-handle"/>
        </div>
        <div id="diagram" dangerouslySetInnerHTML={{ __html: svg }} />
      </React.Fragment>
    );
  }
}

export default AppComponent;
