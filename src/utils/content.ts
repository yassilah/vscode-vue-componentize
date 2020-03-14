import { window } from 'vscode'
import { kebabCase } from 'lodash'

/**
 * Create file content.
 */
export function createContent(text: string, name: string) {
  return [createTemplate(text), createScript(text, name)].join('\n\n').trim()
}

/**
 * Create new component block.
 */
export function createComponentBlock(text: string, name: string) {
  const props = guessProps(text)
    .map(prop => {
      return prop.type === 'model'
        ? `v-model="${prop.key}`
        : `:${kebabCase(prop.key)}="${prop.key}"`
    })
    .join(' ')

  return `<${kebabCase(name)} ${props} />`.trim()
}

/**
 * Replace the current selection with the new component.
 */
export async function replaceContent(text: string, name: string) {
  const editor = window.activeTextEditor
  if (editor) {
    return await editor.edit(builder =>
      builder.replace(editor.selection, createComponentBlock(text, name))
    )
  }
}

/**
 * Add the import for the newly created component.
 */
export async function addImport(path: string, name: string) {
  const editor = window.activeTextEditor
  if (editor) {
    const language = getScriptLanguage()
    const regex = /<script.*?>[\s\S]*?(@Component)/
    const text = editor.document.getText()
    const match = regex.exec(text)
    if (match !== null) {
      const index = match.index + match[0].indexOf(match[1])
      const position = editor.document.positionAt(index - 1)
      return await editor.edit(builder => {
        switch (language) {
          case 'ts':
          case 'typescript':
            return builder.insert(position, `import ${name} from '${path}'\n`)
          default:
            return builder.insert(position, `import ${name} from '${path}'\n`)
        }
      })
    }
  }
}

/**
 * Add the component to the registered components.
 */
export async function addRegisterComponent(name: string) {
  const editor = window.activeTextEditor
  if (editor) {
    const language = getScriptLanguage()
    if (language === 'js') {
    } else if (language === 'ts') {
      const text = editor.document.getText()
      const regexAlreadyComponents = /<script.*?>[\s\S]*?(?:@Component\({[\s\S]*?components:[\s\S]*?{([\s\S]*?)}[\s\S]*?}[\s\S]*?\))/
      const regexAlreadyOptions = /<script.*?>[\s\S]*?(?:@Component\({([\s\S]*?)}[\s\S]*?\))/
      const regexNoOptions = /<script.*?>[\s\S]*?(@Component)/
      let match

      if ((match = regexAlreadyComponents.exec(text)) !== null) {
        const index = match.index + match[0].indexOf(match[1]) + match[1].length
        const position = editor.document.positionAt(index)
        return await editor.edit(builder => {
          builder.insert(position, `, ${name}`)
        })
      } else if ((match = regexAlreadyOptions.exec(text)) !== null) {
        const index = match.index + match[0].indexOf(match[1]) + match[1].length
        const position = editor.document.positionAt(index)
        return await editor.edit(builder => {
          builder.insert(position, `,\n\tcomponents: { ${name} }\n`)
        })
      } else if ((match = regexNoOptions.exec(text)) !== null) {
        const index = match.index + match[0].indexOf(match[1]) + match[1].length
        const position = editor.document.positionAt(index)
        return await editor.edit(builder => {
          builder.insert(position, `({\n\tcomponents: { ${name} }\n})`)
        })
      }
    }
  }
}

/**
 * Create script.
 */
export function createScript(text: string, name: string) {
  const language = getScriptLanguage()
  switch (language) {
    case 'ts':
    case 'typescript':
      return [
        '<script lang="ts">',
        `import { Component, Vue } from 'vue-property-decorator'`,
        '\n@Component',
        `export default class ${name} extends Vue {`,
        createProps(text, language),
        '}',
        '</script>'
      ].join('\n')
    default:
      return [
        '<script>',
        'export default {',
        createProps(text, language),
        '}',
        '</script>'
      ].join('\n')
  }
}

/**
 * Create the props property.
 */
export function createProps(text: string, language: string) {
  const props = guessProps(text)
  if (props.length > 0) {
    switch (language) {
      case 'ts':
      case 'typescript':
        return props
          .map(
            prop => `\t@${prop.decorator}() private ${prop.key}: ${prop.type}`
          )
          .join('\n')
      default:
        return [
          '\tprops: {',
          props
            .map(
              prop =>
                `\t\t${prop.key}: {\n\t\t\ttype: ${prop.type},\n\t\t\trequired: true\n\t\t}`
            )
            .join(',\n'),
          '\t}'
        ].join('\n')
    }
  }

  return ''
}

/**
 * Get template format.
 */
export function getScriptLanguage() {
  return getLanguage('script', 'js')
}

/**
 * Create template.
 */
export function createTemplate(text: string) {
  const language = getTemplateLanguage()
  switch (language) {
    default:
      return ['<template>', text, '</template>'].join('\n')
  }
}

/**
 * Get template format.
 */
export function getTemplateLanguage() {
  return getLanguage('template', 'html')
}

/**
 * Get the content of a given block.
 */
export function getLanguage(tag: string, defaultValue: string) {
  if (window.activeTextEditor) {
    const regex = new RegExp(`<${tag}(?:.*?lang="(.*?)".*?)?>`)
    const lang = regex.exec(window.activeTextEditor.document.getText())
    return (lang && lang[1]) || defaultValue
  }

  return defaultValue
}

/**
 * Guess the props from the template.
 */
export function guessProps(text: string) {
  const props = []
  const regex = /(?:{{(.*)?}})|(?:@(?:.*?)="(.*?)")|(?:v-model="(.*?)")/gm
  let matches
  while ((matches = regex.exec(text)) !== null) {
    if (matches[1]) {
      props.push({ decorator: 'Prop', type: 'string', key: matches[1] })
    } else if (matches[2]) {
      props.push({ decorator: 'Prop', type: 'Function', key: matches[2] })
    } else if (matches[3]) {
      props.push({ decorator: 'Model', type: 'string', key: matches[3] })
    }
  }
  return props
}
