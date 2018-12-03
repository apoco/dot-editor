import OptionsPanel, { OptionsPanelProps } from "./options-panel";
import React = require("react");
import { ChangeEventHandler } from "react";

type JsonPanelState = {
  includeLayout: boolean;
  useExtendedAttribs: boolean;
};

class JsonPanel extends OptionsPanel {
  state: JsonPanelState;

  constructor(props: OptionsPanelProps) {
    super(props);

    this.state = {
      includeLayout: !!(props.format && !props.format.endsWith("_json")),
      useExtendedAttribs:
        props.format === "json" || props.format === "xdot_json"
    };
  }

  handleLayoutOption: ChangeEventHandler<HTMLInputElement> = e => {
    this.updateOptions({
      ...this.state,
      includeLayout: e.target.checked
    });
  };

  updateOptions(newState: JsonPanelState) {
    let format;
    if (this.state.includeLayout) {
      format = this.state.useExtendedAttribs ? "json" : "json0";
    } else {
      format = this.state.useExtendedAttribs ? "xdot_json" : "dot_json";
    }

    this.props.onChange({ format, extension: "json" });

    this.setState(newState);
  }

  render() {
    return (
      <React.Fragment>
        <div>
          <label>
            <input
              type="checkbox"
              checked={this.state.includeLayout}
              onChange={this.handleLayoutOption}
            />
            Include Layout Info
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" />
            Use Extended Attribute (xdot)
          </label>
        </div>
      </React.Fragment>
    );
  }
}

export default JsonPanel;
