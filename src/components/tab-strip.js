import * as React from "react";
import classNames from "classnames";

class TabStrip extends React.Component {
  static defaultProps = {
    onTabSelected: () => {}
  };

  render() {
    const { tabs, activeTabId, onTabSelected } = this.props;

    return (
      <div id="tab-strip">
        {tabs.map(({ tabId, filename, isDirty }) => (
          <div
            className={classNames("tab", { active: tabId === activeTabId })}
            key={tabId}
            onClick={onTabSelected.bind(null, tabId)}
          >
            {filename || "<untitled>"}
            {isDirty && " *"}
          </div>
        ))}
        <div id="tab-strip-border"></div>
      </div>
    );
  }
}

export default TabStrip;