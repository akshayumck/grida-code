---
title: "Observations from the generated code of grida for react/native & flutter"
version: 0.0.1
revision: 1
---


# Architecture
- grida.co/editor is a monorepo built with turborepo relies on reflect-ui's [editor package](https://github.com/reflect-ui/editor-ui) to build its editor next app
- initially this wants you to give your figma access tocken from your account and then a figma design url from your account
- above token and design url's node id is extracted and is parsed as design [file route](/editor/pages/files/[key]/index.tsx)
- layout of this page has 3 vertical sections 
    1. Bookmarks / labels of figma designs
    2. Figma canvas
    3. Code and assets section
- Whenever a user clicks on a label or a design node from figma's canvas that node id is passed to code converter(explained below) and is relevant code of the selected node is printed in the code sections
    - clicked widget/node id is fetched and is passed to [code.worker.js](/editor/scaffolds/code/workers/code.worker.js) an event callback for event type of message
    - this message event later calls handle_code with the node which was clicked which later converts the node to code as a string asynchronously and publishes the produced code to result message of the same worker 
    - the id of the top most node of this code is matched against the clicked id from figma/labels and is then shoed in [code section](/editor/components/code-editor/code-editor.tsx) and relevant assets are shown for the same
    - Handle code function([code.worker.js](/editor/components/code-editor/code-editor.tsx), [design-to-code](/packages/designto-code/universal/design-to-code.ts)) is basically a switch case function which directs the program to fetch code selected framework/language
    - Based on the language node is parsed based on the type figma node and is iterated recursively for child nodes and code is generated.each code generator can be found in its own library([designto-flutter](/packages/designto-flutter/tokens-to-flutter-widget/index.ts),[designto-rn](packages/designto-react-native/tokens-to-rn-widget/index.ts) etc), this is also known as tokenizing and packaging/stringifying. 


# Observations from the generated code of grida for react/native & flutter
- images should be handled!important
- Code should be modular, viz the generated code for a page/ or a widget should have imports, just a dump of the whole component tree is very difficult to work with/ components should be broken to smaller chunks which can then be reused
- On react the code generated should have option to generate mui/ antD/ tailwind/ bootstrap/ chakra/ cupertino(on flutter), vanilla css in styled components is not sufficient
- Ability to download the whole project and run it like any other project
- support for other design tools like XD, invision, framer


<!-- 

![autolayout-overflow-in-figma-the-content-is-bigger-than-parent](./assets/autolayout-overflow-in-figma-the-content-is-bigger-than-parent.png)

## By platforms

- flutter uses SignleChildScrollView & overflowing child.
- css uses `overflow: auto` for enable scrolling.

## The real question - is this scrollable (should it be scrollable) ?

Our answer to this is yes, when the child is bigger than it's parent. BUT only on below scenarios

**YES**

- When child uner layout (e.g. autolayout in figma) is overflowed.

**NO**

- When simply content is overflows inside group / frame as a visual content.

### Strategy 1. set overflow when content is already bigger thatn parent based on design.

### Strategy 2. always overflow when direct child of a root (screen) -->
