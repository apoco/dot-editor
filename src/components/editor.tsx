import * as React from "react";
import AceEditor, { Annotation } from "react-ace";
import "brace/mode/dot";
import "brace/theme/github";
import classNames from "classnames";

import prefs, { EDITOR_FONT_SIZE } from "../prefs/index";
import IPC from "./ipc";
import { DECREASE_FONT, INCREASE_FONT } from "../events/server";

const MIN_FONT_SIZE = 0;
const MAX_FONT_SIZE = 100;

type Props = {
  name: string,
  isActive: boolean,
  width: number,
  annotations: Array<Annotation>,
  value: string,
  onChange: (code: string) => void
};

type State = {
  fontSize: number
};

export default class Editor extends React.PureComponent<Props, State> {
  static defaultProps = {
    value: ""
  };

  constructor(props: Props) {
    super(props);

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

  updateFontSize(delta: number) {
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
        <IPC handlers={{
          [DECREASE_FONT]: this.decreaseFontSize,
          [INCREASE_FONT]: this.increaseFontSize
        }}/>
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
