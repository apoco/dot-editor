import React = require("react");
import OptionsPanel, { OptionsPanelProps } from "./options-panel";
import { ChangeEventHandler } from "react";

type ImageMapPanelState = {
  isClient: boolean;
  isServer: boolean;
  isXHTML: boolean;
  isLegacy: boolean;
  isRectanglesOnly: boolean;
};

class ImageMapPanel extends OptionsPanel {
  state: ImageMapPanelState;

  constructor(props: OptionsPanelProps) {
    super(props);

    this.state = {
      isClient: !props.format || props.format.startsWith('c'),
      isServer: !!(props.format && props.format.startsWith('i')),
      isXHTML: !props.format || props.format.startsWith('cmapx'),
      isLegacy: props.format === 'ismap',
      isRectanglesOnly: !!(props.format && props.format.endsWith('_np'))
    };
  }

  handleClientChange: ChangeEventHandler<HTMLInputElement> = e => {
    const isClient = e.target.checked;
    const isServer = !isClient;
    this.updateState({ ...this.state, isClient, isServer });
  };

  handleServerChange: ChangeEventHandler<HTMLInputElement> = e => {
    const isServer = e.target.checked;
    const isClient = !isServer;
    this.updateState({ ...this.state, isClient, isServer });
  };

  handleXhtmlOption: ChangeEventHandler<HTMLInputElement> = e => {
    const isXHTML = e.target.checked;
    this.updateState({ ...this.state, isXHTML });
  };

  handleLegacyOption: ChangeEventHandler<HTMLInputElement> = e => {
    const isLegacy = e.target.checked;
    this.updateState({ ...this.state, isLegacy });
  };

  handleRectangleOption: ChangeEventHandler<HTMLInputElement> = e => {
    const isRectanglesOnly = e.target.checked;
    this.updateState({ ...this.state, isRectanglesOnly });
  };

  updateState({
    isClient,
    isServer,
    isXHTML,
    isLegacy,
    isRectanglesOnly
  }: ImageMapPanelState) {
    let format;
    if (isServer) {
      if (isLegacy) {
        format = 'ismap';
      } else {
        format = isRectanglesOnly ? "imap_np" : "imap";
      }
    } else if (isXHTML) {
      format = isRectanglesOnly ? "cmapx_np" : "cmapx";
    } else {
      format = "cmap";
    }

    this.props.onChange({ format, extension: "html" });

    this.setState({ isClient, isServer });
  }

  render() {
    return (
      <React.Fragment>
        {this.renderClientServerOpts()}
        {this.renderXhtmlOpts()}
        {this.renderLegacyOpts()}
        {this.renderRectangleOpts()}
      </React.Fragment>
    );
  }

  renderClientServerOpts() {
    return (
      <div>
        <label>
          <input
            type="radio"
            checked={this.state.isClient}
            onChange={this.handleClientChange}
          />
          Client
        </label>
        <label>
          <input
            type="radio"
            checked={this.state.isServer}
            onChange={this.handleServerChange}
          />
          Server
        </label>
      </div>
    );
  }

  renderXhtmlOpts() {
    return (
      this.state.isClient && (
        <div>
          <label>
            <input
              type="checkbox"
              checked={this.state.isXHTML}
              onChange={this.handleXhtmlOption}
            />
            XHTML
          </label>
        </div>
      )
    );
  }

  renderLegacyOpts() {
    return (
      this.state.isServer && (
        <div>
          <label>
            <input
              type="checkbox"
              checked={this.state.isLegacy}
              onChange={this.handleLegacyOption}
            />
            Legacy Format
          </label>
        </div>
      )
    );
  }

  renderRectangleOpts() {
    return (
      ((this.state.isServer && !this.state.isLegacy) || this.state.isXHTML) && (
        <div>
          <label>
            <input
              type="checkbox"
              checked={this.state.isRectanglesOnly}
              onChange={this.handleRectangleOption}
            />
            Rectangles Only
          </label>
        </div>
      )
    );
  }
}

export default ImageMapPanel;
