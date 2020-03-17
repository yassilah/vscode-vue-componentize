# Vue Componentize

This extension allows you to automatically create a separate vue component from a selected block of a template.

## Usage

In a .vue file, select a block of text inside your \<template\> tag. Open the command palette, look for "Componentize" and hit enter. You will then be asked what name should the newly created component have.

![vue-componentize-preview](https://github.com/yassipad/vscode-vue-componentize/blob/master/vue-componentize.gif)
![vue-componentize-result](https://github.com/yassipad/vscode-vue-componentize/blob/master/vue-componentize.png)

## Features

The extension will automatically try to guess which props should be added to your newly created component and ask you for the relevant types and whether each prop should be required.
As of now, the extension works with JavaScript and TypeScript.

- [x] Create empty script tag if it doesn't exist in JS
- [x] Create empty script tag if it doesn't exist in TS
- [x] Automatically add import statement in JS
- [x] Automatically add import statement in TS
- [ ] Automatically add imported component to component option in JS
- [ ] Automatically add imported component to component option in TS
- [x] Automatically create new component with custom name and location in JS
- [x] Automatically create new component with custom name and location in TS
- [x] Automatically apply user-defined template and script style
- [x] Guess props to include
- [x] Ask user for props types
- [x] Ask user for props required option
- [x] Replace selection with newly created component with props
- [ ] Handling v-model when on root element
- [ ] Handling v-for when on root element
- [ ] Throw error/warning when selection cannot be valid component template (e.g. multiple root elements)

## Configuration

You can set different configuration values to optimize the creation process. Please refer to the Vue Componentize section of your settings to see the full options' description.
