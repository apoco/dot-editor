import OptionsPanel, { OptionsPanelProps } from "./options-panel";
import * as React from "react";
import { ChangeEventHandler } from "react";

class VmlOptionsPanel extends OptionsPanel {
  state: {
    isCompressed: boolean;
  };

  constructor(props: OptionsPanelProps) {
    super(props);

    this.state = {
      isCompressed: !props.format || props.format === 'vmlz'
    };
  }

  handleCompressionOption: ChangeEventHandler<HTMLInputElement> = e => {
    const isCompressed = e.target.checked;

    this.props.onChange({
      format: isCompressed ? "vmlz" : "vml",
      extension: "vml"
    });

    this.setState({ isCompressed });
  };

  render() {
    return (
      <label>
        <input
          type="checkbox"
          checked={this.state.isCompressed}
          onChange={this.handleCompressionOption}
        />
        Compress
      </label>
    );
  }
}

export default VmlOptionsPanel;
