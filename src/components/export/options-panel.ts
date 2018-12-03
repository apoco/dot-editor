import * as React from "react";

type ExportOptions = {
  format: string;
  extension: string;
};

export type OptionsPanelProps = {
  extension: string | null;
  format: string | null;
  onChange: (opts: ExportOptions) => void;
};

class OptionsPanel<
  T extends OptionsPanelProps = OptionsPanelProps
> extends React.Component<T> {}

export default OptionsPanel;
