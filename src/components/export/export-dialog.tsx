import * as React from "react";
import { ChangeEventHandler, MouseEvent } from "react";

import { extname } from "path";
import IPC from "../ipc";
import formats from "../../utils/export-formats";
import NoOptionsPanel from "./no-options-panel";
import { ipcRenderer } from "electron";
import {
  ExportDialogEvents,
  EXPORT_FILE_BROWSE,
  EXPORT, EXPORT_DIALOG_LOADED
} from "../../events/export-events";
import {
  SET_EXPORT_DEFAULTS,
  SET_EXPORT_FILENAME
} from "../../events/server-events";

type Props = {};

type State = {
  filename: string;
  format: string;
  extension: string;
  exportOption: string;
};

class ExportDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filename: "",
      format: "",
      extension: "",
      exportOption: "auto"
    };
  }

  componentDidMount(): void {
    document.addEventListener("keydown", this.handleKeyDown, true);
    this.sendEvent(EXPORT_DIALOG_LOADED, {});
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.handleKeyDown, true);
  }

  private handleExportDefaults = (e: {
    sourceFilename: string;
    format: string;
    extension: string;
  }) => {
    this.setState({
      filename: this.replaceExtension(
        e.sourceFilename,
        this.getExtension(e.sourceFilename),
        e.extension
      ),
      extension: e.extension,
      format: e.format
    });
  };

  private handleBrowseClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.sendEvent(EXPORT_FILE_BROWSE, { filename: this.state.filename });
  };

  private handleSetFilename = (e: { filename: string }) => {
    this.setFilename(e.filename);
  };

  private handleFilenameChange: ChangeEventHandler<HTMLInputElement> = e => {
    const filename = e.target.value;
    this.setFilename(filename);
  };

  private handleFormatChange: ChangeEventHandler<HTMLSelectElement> = e => {
    const exportOption = e.target.value;
    let { filename, extension, format } = this.state;
    if (exportOption !== "auto") {
      const opt = formats[+exportOption];
      format = opt.defaultFormat;
      filename = this.replaceFileExtension(opt.defaultExtension);
      extension = opt.defaultExtension;
    }

    this.setState({
      filename,
      extension,
      format,
      exportOption
    });
  };

  private handleFormatOptionsChange = ({
    format,
    extension
  }: {
    format: string;
    extension: string;
  }) => {
    this.setState({
      format,
      extension,
      filename: this.replaceFileExtension(extension)
    });
  };

  private handleExportClick = (e: MouseEvent<HTMLButtonElement>) => {
    const { filename, format } = this.state;
    this.sendEvent(EXPORT, { filename, format });
  };

  private handleCancelClick = (e: MouseEvent<HTMLButtonElement>) => {
    this.cancel();
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == "Escape") {
      this.cancel();
    }
  };

  render() {
    return (
      <div className="export-options">
        {this.renderIPC()}
        {this.renderFilename()}
        {this.renderFormat()}
        {this.renderOptions()}
        {this.renderButtons()}
      </div>
    );
  }

  private renderIPC() {
    return (
      <IPC
        handlers={{
          [SET_EXPORT_FILENAME]: this.handleSetFilename,
          [SET_EXPORT_DEFAULTS]: this.handleExportDefaults
        }}
      />
    );
  }

  private renderFilename() {
    return (
      <React.Fragment>
        <label htmlFor="filename">Filename:</label>
        <input
          id="filename"
          type="text"
          value={this.state.filename}
          onChange={this.handleFilenameChange}
        />
        <button id="browse-btn" onClick={this.handleBrowseClick}>
          Browse...
        </button>
      </React.Fragment>
    );
  }

  private renderFormat() {
    return (
      <React.Fragment>
        <label htmlFor="format">Format:</label>
        <select
          id="format"
          value={this.state.exportOption}
          onChange={this.handleFormatChange}
        >
          <option value="auto">Auto (use file extension)</option>
          {formats.map((format, i) => (
            <option key={i} value={String(i)}>
              {format.name}
            </option>
          ))}
        </select>
      </React.Fragment>
    );
  }

  private renderOptions() {
    const { extension, format, exportOption } = this.state;
    const OptionsPanel =
      (exportOption !== "auto" && formats[+exportOption].panel) ||
      NoOptionsPanel;

    return (
      <div id="options">
        <OptionsPanel
          extension={extension}
          format={format}
          onChange={this.handleFormatOptionsChange}
        />
      </div>
    );
  }

  private renderButtons() {
    return (
      <div id="buttons">
        <button id="ok-btn" onClick={this.handleExportClick}>
          Export
        </button>
        <button id="cancel-btn" onClick={this.handleCancelClick}>
          Cancel
        </button>
      </div>
    );
  }

  private setFilename(filename: string) {
    const extension = this.getExtension(filename);
    let { exportOption, format } = this.state;

    if (extension !== this.state.extension) {
      const exportOptionIndex = formats.findIndex(
        format =>
          format.defaultExtension === extension ||
          !!(format.extensionFormats && extension in format.extensionFormats)
      );
      if (exportOptionIndex > -1) {
        exportOption = String(exportOptionIndex);
        const opt = formats[exportOptionIndex];
        format =
          (opt.extensionFormats && opt.extensionFormats[extension]) ||
          opt.defaultFormat;
      }
    }

    this.setState({
      filename,
      extension,
      format,
      exportOption
    });
  }

  private replaceFileExtension(newExtension: string) {
    const { filename, extension } = this.state;
    return this.replaceExtension(filename, extension, newExtension);
  }

  private getExtension(filename: string) {
    return extname(filename)
      .replace(".", "")
      .toLowerCase();
  }

  private replaceExtension(
    filename: string,
    oldExtension: string,
    newExtension: string
  ) {
    return filename.replace(
      new RegExp(`\\.${oldExtension}$`, "i"),
      `.${newExtension}`
    );
  }

  private cancel() {
    window.close();
  }

  private sendEvent<T extends keyof ExportDialogEvents>(
    type: T,
    payload: ExportDialogEvents[T]
  ) {
    ipcRenderer.send(type, payload);
  }
}

export default ExportDialog;
