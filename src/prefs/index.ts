import Store = require('electron-store');

export const EDITOR_WIDTH = "layouts.horizontal.editorWidth";
export const EDITOR_FONT_SIZE = 'editor.fontSize';

export default new Store({
  name: 'prefs'
});
