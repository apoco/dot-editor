import * as React from "react";
import { ChangeEventHandler } from "react";
import OptionsPanel, { OptionsPanelProps } from "./options-panel";

class PlainFormatPanel extends OptionsPanel {
  state: {
    includePorts: boolean;
  };

  constructor(props: OptionsPanelProps) {
    super(props);
    this.state = {
      includePorts: props.format === 'plain-ext'
    };
  }

  handlePortsOption: ChangeEventHandler<HTMLInputElement> = e => {
    const includePorts = e.target.checked;
    this.props.onChange({
      format: includePorts ? "plain-ext" : "plain",
      extension: "txt"
    });
    this.setState({ includePorts });
  };

  render() {
    return (
      <label>
        <input
          type="checkbox"
          checked={this.state.includePorts}
          onChange={this.handlePortsOption}
        />
        Include Ports
      </label>
    );
  }
}

export default PlainFormatPanel;
