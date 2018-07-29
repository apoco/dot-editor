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
        <div id="tab-strip-inner">
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
        </div>
      </div>
    );
  }
}

export default TabStrip;
