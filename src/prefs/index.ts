import Store = require('electron-store');

export const EDITOR_WIDTH = "layouts.horizontal.editorWidth";
export const EDITOR_FONT_SIZE = 'editor.fontSize';
export const EXPORT_EXTENSION = 'export.extension';
export const EXPORT_FORMAT = 'export.format';

export default new Store({
  name: 'prefs'
});
