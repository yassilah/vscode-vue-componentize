import {
  workspace,
  window,
  Uri,
  TextEditor,
  WorkspaceConfiguration
} from 'vscode'
import { relative, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

/**
 * Get the file root path.
 */
export function getRootPath(editor: TextEditor) {
  return (
    workspace.rootPath ||
    editor.document.fileName
      .split('/')
      .slice(0, -1)
      .join('/')
  )
}

/**
 * Get the relative path to the current file.
 */
export function getRelativePath(editor: TextEditor, absolutePath: string) {
  return './' + relative(getRootPath(editor), absolutePath)
}

/**
 * Get components path.
 */
export function getComponentPath(
  name: string,
  editor: TextEditor,
  configuration: WorkspaceConfiguration
) {
  const configPath = configuration.get('components.path') as string

  const path = configPath.replace(/\${root}/, getRootPath(editor))

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }

  return join(path, name + '.vue')
}

/**
 * Get VS Code path.
 */
export function getVSPath(path: string) {
  return Uri.parse('file://' + path)
}
