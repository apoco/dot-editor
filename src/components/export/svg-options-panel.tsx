import OptionsPanel, { OptionsPanelProps } from "./options-panel";
import * as React from "react";
import { ChangeEventHandler } from "react";

type State = {
  isCompressed: boolean;
};

class SvgOptionsPanel extends OptionsPanel {
  state: State;

  constructor(props: OptionsPanelProps) {
    super(props);

    this.state = {
      isCompressed: props.format === "svgz" || props.extension === "svgz"
    };
  }

  componentDidUpdate(
    prevProps: Readonly<OptionsPanelProps>,
    prevState: Readonly<State>,
    snapshot?: any
  ): void {
    const { extension } = this.props;
    if (extension !== prevProps.extension) {
      if (extension === 'svg') {
        this.setState({ isCompressed: false });
      } else if (extension === 'svgz') {
        this.setState({ isCompressed: true });
      }
    }
  }

  handleCompressionOption: ChangeEventHandler<HTMLInputElement> = e => {
    const isCompressed = e.target.checked;

    this.props.onChange({
      format: isCompressed ? "svgz" : "svg",
      extension: isCompressed ? "svgz" : "svg"
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

export default SvgOptionsPanel;
