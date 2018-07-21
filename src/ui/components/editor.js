import * as React from 'react';
import AceEditor from "react-ace";
import "brace/mode/dot";
import "brace/theme/github";

export default class Editor extends React.PureComponent {
  static defaultProps = {
    value: ''
  };

  render() {
    return <AceEditor
      name="editor"
      mode="dot"
      theme="github"
      width="auto"
      height="auto"
      focus={true}
      debounceChangePeriod={500}
      annotations={this.props.annotations}
      value={this.props.value}
      onChange={this.props.onChange}
    />;
  }
};
