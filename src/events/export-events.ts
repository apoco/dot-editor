export const EXPORT_DIALOG_LOADED = 'EXPORT_DIALOG_LOADED';
export const EXPORT_FILE_BROWSE = 'EXPORT_FILE_BROWSE';
export const EXPORT = 'EXPORT';

export type ExportDialogEvents = {
  [EXPORT_DIALOG_LOADED]: {},
  [EXPORT_FILE_BROWSE]: {
    filename: string
  },
  [EXPORT]: {
    filename: string,
    format: string
  }
}
