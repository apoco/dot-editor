import * as React from "react";
import { OptionsPanelProps } from "./options-panel";
import { ChangeEventHandler } from "react";
import OptionsPanel from "./options-panel";

type PostScriptPanelState = {
  usePdfNotations: boolean;
};

class PostScriptPanel extends OptionsPanel {
  state: PostScriptPanelState;

  constructor(props: OptionsPanelProps) {
    super(props);

    this.state = {
      usePdfNotations: !props.format || props.format === 'ps'
    };
  }

  handlePdfOption: ChangeEventHandler<HTMLInputElement> = e => {
    const usePdfNotations = e.target.checked;
    this.props.onChange({
      format: usePdfNotations ? "ps2" : "ps",
      extension: "ps"
    });
    this.setState({ usePdfNotations });
  };

  render() {
    return (
      <label>
        <input
          type="checkbox"
          checked={this.state.usePdfNotations}
          onChange={this.handlePdfOption}
        />
        Include PDF Notations
      </label>
    );
  }
}

export default PostScriptPanel;
