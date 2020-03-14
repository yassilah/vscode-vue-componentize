import { workspace, window, Uri } from 'vscode'
import { relative, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

/**
 * Get the file root path.
 */
export function getRootPath() {
  return (
    workspace.rootPath ||
    (window.activeTextEditor
      ? window.activeTextEditor.document.fileName
          .split('/')
          .slice(0, -1)
          .join('/')
      : '')
  )
}

/**
 * Get the relative path to the current file.
 */
export function getRelativePath(filePath: string) {
  return './' + relative(getRootPath(), filePath)
}

/**
 * Get components path.
 */
export function getComponentsPath() {
  const path = join(getRootPath(), 'components')

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }

  return path
}

/**
 * Get VS Code path.
 */
export function getVSPath(path: string) {
  return Uri.parse('file://' + path)
}
