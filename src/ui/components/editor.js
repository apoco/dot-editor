import * as React from "react";
import AceEditor from "react-ace";
import "brace/mode/dot";
import "brace/theme/github";
import classNames from "classnames";

import prefs, { EDITOR_FONT_SIZE } from "../../prefs";
import { DECREASE_FONT, INCREASE_FONT } from "../../constants/messages";
import IPC from "./ipc";

const MIN_FONT_SIZE = 0;
const MAX_FONT_SIZE = 100;

export default class Editor extends React.PureComponent {
  static defaultProps = {
    value: ""
  };

  constructor() {
    super();

    this.state = {
      fontSize: prefs.get(EDITOR_FONT_SIZE, 12)
    };
  }

  decreaseFontSize = () => {
    this.updateFontSize(-1);
  };

  increaseFontSize = () => {
    this.updateFontSize(+1);
  };

  updateFontSize(delta) {
    const newSize = this.state.fontSize + delta;
    this.setState({
      fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, newSize))
    });
    prefs.set(EDITOR_FONT_SIZE, newSize);
  }

  render() {
    const { name, isActive, width, annotations, value, onChange } = this.props;

    return (
      <div className={classNames("editor", { active: isActive })}>
        <IPC
          {...{
            [DECREASE_FONT]: this.decreaseFontSize,
            [INCREASE_FONT]: this.increaseFontSize
          }}
        />
        <AceEditor
          name={name}
          mode="dot"
          theme="github"
          width={`${width}px`}
          height="100%"
          fontSize={this.state.fontSize}
          focus={isActive}
          debounceChangePeriod={500}
          annotations={annotations}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  }
}
