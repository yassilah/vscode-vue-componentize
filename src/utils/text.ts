import { window } from 'vscode'
import { startCase, toLower } from 'lodash'

/**
 * Get the selected text.
 */
export function getSelectedText() {
  if (window.activeTextEditor) {
    return window.activeTextEditor.document.getText(
      window.activeTextEditor.selection
    )
  }
}

/**
 * Studly case.
 */
export function studlyCase(text: string = '') {
  return startCase(toLower(text)).replace(/ /g, '')
}
