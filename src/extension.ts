import {
  workspace,
  commands,
  ExtensionContext,
  window,
  TextEditor
} from 'vscode'
import { parseComponent } from 'vue-template-compiler'
import { studlyCase } from './utils/text'
import { getComponentPath, getRelativePath } from './utils/path'
import {
  addImportToCurrentDocument,
  createComponent,
  replaceSelectionWithComponent
} from './utils/content'

export function activate(context: ExtensionContext) {
  const disposable = commands.registerTextEditorCommand(
    'extension.componentize',
    async (editor: TextEditor) => {
      try {
        if (editor.document.languageId === 'vue') {
          const { selection } = editor
          const text = editor.document.getText(selection)
          const component = parseComponent(editor.document.getText())
          const configuration = workspace.getConfiguration('vue-componentize')
          const name = await window.showInputBox({
            prompt: 'What should the name of your component be?',
            validateInput(value: string) {
              if (value === '') {
                return 'The name cannot be empty.'
              }
            }
          })
          const studlyName = studlyCase(name)
          const absolutePath = getComponentPath(
            studlyName,
            editor,
            configuration
          )
          const relativePath = getRelativePath(editor, absolutePath)

          await addImportToCurrentDocument(
            editor,
            studlyName,
            relativePath,
            component,
            configuration
          )
          await createComponent(editor, absolutePath, studlyName, configuration)
        } else {
          throw new Error('You can only componentize inside a .vue file.')
        }
      } catch (error) {
        window.showErrorMessage(error)
      }
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
