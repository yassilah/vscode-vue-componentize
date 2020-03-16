import {
  Position,
  WorkspaceConfiguration,
  TextEditor,
  Uri,
  workspace,
  commands,
  window,
  WorkspaceEdit,
  TextEdit
} from 'vscode'
import {
  SFCDescriptor,
  parseComponent,
  compile,
  ASTNode,
  ASTElement,
  ASTText
} from 'vue-template-compiler'
import { writeFileSync } from 'fs'
import { studlyCase } from './text'
import { basename, join } from 'path'
import { kebabCase, camelCase } from 'lodash'
/**
 * Get template tag text.
 */
export function getTemplateTag(
  content: string,
  configuration: WorkspaceConfiguration
) {
  const language = configuration.get(`template.defaultLanguage`) as string
  const template = configuration.get(`template.${language}.template`) as string
  return [
    `<template${language !== 'html' ? ` lang="${language}"` : ''}>`,
    template.replace(/\${content}/, content),
    '</template>'
  ].join('\n')
}

/**
 * Get script tag text.
 */
export function getScriptTag(
  studlyName: string,
  propsList: any[],
  configuration: WorkspaceConfiguration
) {
  const language = configuration.get(`script.defaultLanguage`) as string
  const template = configuration.get(`script.${language}.template`) as string

  return [
    '\n',
    `<script${language !== 'js' ? ` lang="${language}"` : ''}>`,
    template
      .replace(/\${content}/, getPropsText(propsList, configuration, language))
      .replace(/\${name}/, studlyName),
    '</script>'
  ].join('\n')
}

/**
 * Get the list of props to add.
 */
export function getPropsList(content: string) {
  const compiled = compile(content)

  const props: any[] = []

  function _(block: ASTElement | ASTText | ASTNode, exclude: string[] = []) {
    if ('tokens' in block) {
      block.tokens.forEach(token => {
        if (typeof token === 'object') {
          if ('@binding' in token) {
            token['@binding'].match(/[A-z_]+/g).forEach((key: string) => {
              if (!exclude.includes(key)) {
                props.push({
                  type: 'any',
                  key,
                  camelKey: camelCase(key),
                  required: false
                })
              }
            })
          }
        }
      })
    } else if ('directives' in block && block.directives) {
      block.directives.forEach(directive => {
        if (!exclude.includes(directive.value)) {
          props.push({
            type: 'any',
            key: directive.value,
            required: false,
            camelKey: camelCase(directive.value),
            model: directive.name === 'model'
          })
        }
      })
    } else if ('for' in block && block.for) {
      if (!exclude.includes(block.for)) {
        props.push({
          type: 'any[]',
          key: block.for,
          camelKey: camelCase(block.for),
          required: false
        })
      }
      if (block.alias) exclude.push(block.alias)
      if (block.iterator1) exclude.push(block.iterator1)
      if (block.iterator2) exclude.push(block.iterator2)
    }

    if ('children' in block) {
      block.children.forEach(b => _(b, exclude))
    }
  }

  if (compiled.ast) {
    _(compiled.ast)
  }

  return props
}

/**
 * Get props text.
 */
export function getPropsText(
  propsList: any[],
  configuration: WorkspaceConfiguration,
  language: string
) {
  const template = configuration.get(
    `script.${language}.props.template`
  ) as string

  if (language === 'ts') {
    return [
      '\n\t',
      ...propsList
        .map(prop => {
          return template
            .replace(/\${options}/g, prop.required ? `{ required: true }` : '')
            .replace(/\${name}/g, prop.camelKey + (prop.required ? '!' : '?'))
            .replace(/\${type}/g, prop.type)
        })
        .join('\n\t'),
      '\n'
    ].join('')
  } else if (language === 'js') {
    return [
      '\n',
      '\tprops: {',
      ...propsList.map(prop =>
        template
          .replace(/\${name}/g, prop.camelKey)
          .replace(/\${type}/g, prop.type)
          .replace(/\${required}/g, prop.required)
      ),
      '\t}'
    ].join('\n')
  }

  return ''
}

/**
 * Get script tag text.
 */
export function getEmptyScriptTag(
  language: string,
  studlyName: string,
  configuration: WorkspaceConfiguration
) {
  const template = configuration.get(`script.${language}.template`) as string
  return [
    '\n',
    `<script${language !== 'js' ? ` lang="${language}"` : ''}>`,
    template.replace(/\${name}/, studlyName).replace(/\${content}/, ''),
    '</script>'
  ].join('\n')
}

/**
 * Add a script tag if the current document does not contain one.
 */
export async function addEmptyScriptToCurrentDocument(
  editor: TextEditor,
  component: SFCDescriptor,
  configuration: WorkspaceConfiguration
) {
  const position = component.template
    ? new Position(
        editor.document.positionAt(component.template.end!).line + 1,
        0
      )
    : new Position(0, 0)

  const language = configuration.get('script.defaultLanguage') as string
  const studlyName = studlyCase(basename(editor.document.fileName, 'vue'))

  const text = getEmptyScriptTag(language, studlyName, configuration)

  await editor.edit(builder => {
    builder.insert(position, text)
  })

  return parseComponent(editor.document.getText())
}

/**
 * Get the import text.
 */
export function getImportToCurrentDocumentText(
  language: string,
  studlyName: string,
  relativePath: string,
  configuration: WorkspaceConfiguration
) {
  const template = configuration.get(
    `script.${language}.import.template`
  ) as string

  const path = configuration.get(`script.${language}.import.path`) as string

  return template
    .replace(/\${name}/, studlyName)
    .replace(/\${path}/, join(path, basename(relativePath)))
}

/**
 * Add the newly created component to the list of imports.
 */
export async function addImportToCurrentDocument(
  editor: TextEditor,
  studlyName: string,
  relativePath: string,
  component: SFCDescriptor,
  configuration: WorkspaceConfiguration
) {
  if (!component.script || !component.script!.content) {
    component = await addEmptyScriptToCurrentDocument(
      editor,
      component,
      configuration
    )
  }

  const language = component.script!.lang || 'js'
  const { line } = editor.document.positionAt(component.script!.start!)
  const position = new Position(line + 1, 0)
  const text = getImportToCurrentDocumentText(
    language,
    studlyName,
    relativePath,
    configuration
  )

  await editor.edit(builder => {
    builder.insert(position, text)
  })

  return parseComponent(editor.document.getText())
}

/**
 * Create the new component.
 */
export async function createComponent(
  editor: TextEditor,
  absolutePath: string,
  studlyName: string,
  configuration: WorkspaceConfiguration
) {
  const text = editor.document.getText(editor.selection)
  const propsList = getPropsList(text)
  const language = configuration.get('script.defaultLanguage') as string
  const types =
    language === 'js'
      ? ['Number', 'String', 'Function', 'Other']
      : ['number', 'string', 'Function', 'any', 'any[]', 'Other']

  for (let i = 0; i < propsList.length; i++) {
    const prop = propsList[i]
    let type = await window.showQuickPick(types, {
      placeHolder: `What is the type of the "${prop.camelKey}" prop?`
    })
    if (type === 'Other') {
      type = await window.showInputBox({
        placeHolder: `What is the type of the "${prop.camelKey}" prop?`,
        value: prop.type
      })
    }
    prop.type = type || 'any'
    const required = await window.showQuickPick(['Yes', 'No'], {
      placeHolder: `Should the "${prop.camelKey}" prop be required?`
    })
    prop.required = required === 'Yes'
    if (prop.model) {
      text.replace(`v-model="${prop.key}"`, `v-model="${prop.camelKey}"`)
    }
  }

  writeFileSync(
    absolutePath,
    [
      getTemplateTag(text, configuration),
      getScriptTag(studlyName, propsList, configuration)
    ].join('\n'),
    { encoding: 'utf8' }
  )
  const uri = Uri.parse(absolutePath)
  const doc = await workspace.openTextDocument(uri)
  const edits = (await commands.executeCommand(
    'vscode.executeFormatDocumentProvider',
    doc.uri
  )) as TextEdit[]
  const formatEdit = new WorkspaceEdit()
  formatEdit.set(uri, edits)
  await workspace.applyEdit(formatEdit)
  doc.save()
  await replaceSelectionWithComponent(
    editor,
    propsList,
    studlyName,
    configuration
  )
}

/**
 * Get the component text.
 */
export function getComponentText(studlyName: string, propsList: any[]) {
  return [
    '<',
    kebabCase(studlyName),
    ' ',
    propsList.map(prop => `:${kebabCase(prop.key)}="${prop.key}"`).join(' '),
    '/>'
  ].join('')
}

/**
 * Replace the curent selection with the newly created component.
 */
export async function replaceSelectionWithComponent(
  editor: TextEditor,
  propsList: any[],
  studlyName: string,
  configuration: WorkspaceConfiguration
) {
  await editor.edit(builder => {
    builder.replace(editor.selection, getComponentText(studlyName, propsList))
  })
  const edits = (await commands.executeCommand(
    'vscode.executeFormatDocumentProvider',
    editor.document.uri
  )) as TextEdit[]
  const formatEdit = new WorkspaceEdit()
  formatEdit.set(editor.document.uri, edits)
  await workspace.applyEdit(formatEdit)
  editor.document.save()
}
