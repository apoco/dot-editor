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
        <div id='tabs'>
          {tabs.map(({ tabId, filename, isDirty }) => {
            const tabTitle = filename || "<untitled>";

            return (
              <div
                title={tabTitle}
                className={classNames("tab", { active: tabId === activeTabId })}
                key={tabId}
                onClick={onTabSelected.bind(null, tabId)}
              >
                &#8234;
                {tabTitle}
                {isDirty && " *"}
              </div>
            );
          })}
        </div>
        <div id="tab-strip-border"/>
      </div>
    );
  }
}

export default TabStrip;
