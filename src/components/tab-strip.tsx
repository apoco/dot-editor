import * as React from "react";
import classNames from "classnames";
import Tab from "../model/tab";
import { SyntheticEvent } from "react";

type Props = {
  tabs: Array<Tab>,
  activeTabId: string | null,
  onTabSelected: (tabId: string, event: MouseEvent) => void
}

class TabStrip extends React.Component<Props, {}> {
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
