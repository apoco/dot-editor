import OptionsPanel, { OptionsPanelProps } from "./options-panel";
import React = require("react");
import { ChangeEventHandler } from "react";

type State = {
  isCompressed: boolean;
};

class GdPanel extends OptionsPanel {
  state: State;

  constructor(props: OptionsPanelProps) {
    super(props);

    this.state = {
      isCompressed: props.format === "gd2" || props.extension === "gd2"
    };
  }

  componentDidUpdate(
    prevProps: Readonly<OptionsPanelProps>,
    prevState: Readonly<State>,
    snapshot?: any
  ): void {
    const { extension } = this.props;
    if (extension !== prevProps.extension) {
      if (extension === 'gd') {
        this.setState({ isCompressed: false });
      } else if (extension === 'gd2') {
        this.setState({ isCompressed: true });
      }
    }
  }

  handleCompressionOption: ChangeEventHandler<HTMLInputElement> = e => {
    const isCompressed = e.target.checked;
    const format = isCompressed ? "gd2" : "gd";
    const extension = isCompressed ? "gd2" : "gd";
    this.props.onChange({ format, extension });
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
        Compressed
      </label>
    );
  }
}

export default GdPanel;
