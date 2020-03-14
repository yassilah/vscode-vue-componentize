import { window, workspace, Uri, commands, ExtensionContext } from 'vscode'
import { join } from 'path'
import { writeFileSync } from 'fs'
import {
  getRootPath,
  getVSPath,
  getRelativePath,
  getComponentsPath
} from './utils/path'
import { getSelectedText, studlyCase } from './utils/text'
import {
  createContent,
  replaceContent,
  addImport,
  addRegisterComponent
} from './utils/content'

export function activate(context: ExtensionContext) {
  const disposable = commands.registerCommand(
    'extension.componentize',
    async () => {
      try {
        const rootPath = getRootPath()
        const text = getSelectedText()

        if (rootPath && text) {
          const editor = window.activeTextEditor!

          const name = await window.showInputBox({
            prompt: 'What should the name of your component be?',
            validateInput(value) {
              if (value === '') {
                return 'The name cannot be empty.'
              }
            }
          })

          const studlyName = studlyCase(name)
          const filePath = join(getComponentsPath(), `${studlyName}.vue`)

          writeFileSync(filePath, createContent(text, studlyName), 'utf8')

          const doc = await workspace.openTextDocument(getVSPath(filePath))

          await replaceContent(text, studlyName)
          await addImport(getRelativePath(filePath), studlyName)
          await addRegisterComponent(studlyName)
          editor.document.save()
          doc.save()
        }
      } catch (error) {
        console.log(error)
      }
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
