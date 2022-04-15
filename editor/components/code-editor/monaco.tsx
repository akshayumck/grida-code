import React, { useRef, useEffect } from "react";
import Editor, {
  useMonaco,
  Monaco,
  OnMount,
  OnChange,
} from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { MonacoEmptyMock } from "./monaco-mock-empty";
import { register } from "./monaco-utils";
import { __dangerous__lastFormattedValue__global } from "@code-editor/prettier-services";

type ICodeEditor = monaco.editor.IStandaloneCodeEditor;

export interface MonacoEditorProps {
  defaultValue?: string;
  defaultLanguage?: string;
  onChange?: OnChange;
  width?: number | string;
  height?: number | string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export function MonacoEditor(props: MonacoEditorProps) {
  const instance = useRef<{ editor: ICodeEditor; format: any } | null>(null);
  const activeModel = useRef<any>();

  const onMount: OnMount = (editor, monaco) => {
    const format = editor.getAction("editor.action.formatDocument");
    const rename = editor.getAction("editor.action.rename");

    instance.current = { editor, format };

    activeModel.current = editor.getModel();

    register.initEditor(editor, monaco);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
      format.run();
    });

    // disabled. todo: find a way to format on new line, but also with adding new line.
    // editor.addCommand(monaco.KeyCode.Enter, function () {
    //   format.run();
    // });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, function () {
      // don't reload the entire page, and..
      // Default is F2
      rename.run();
    });

    editor.addAction({
      // An unique identifier of the contributed action.
      id: "export-module-as-file",

      // A label of the action that will be presented to the user.
      label: "Export as file",
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      run: function (ed) {
        var data = new Blob([ed.getModel().getValue()], { type: "text/txt" });
        var csvURL = window.URL.createObjectURL(data);
        const tempLink = document.createElement("a");
        tempLink.href = csvURL;
        tempLink.setAttribute("download", "filename.csv");
        tempLink.click();
      },
    });

    editor.onDidChangeModelContent((e) => {
      /* add here */
    });
  };

  return (
    <Editor
      beforeMount={register.initMonaco}
      onMount={onMount}
      width={props.width}
      height={props.height}
      defaultLanguage={
        pollyfill_language(props.defaultLanguage) ?? "typescript"
      }
      loading={<MonacoEmptyMock l={5} />}
      defaultValue={props.defaultValue ?? "// no content"}
      theme="vs-dark"
      onChange={(...v) => {
        if (v[0] === __dangerous__lastFormattedValue__global) {
          // if change is caused by formatter, ignore.
          return;
        }
        props.onChange(...v);
      }}
      options={{
        ...props.options,
        // overrided default options
        wordWrap: "off",
        unusualLineTerminators: "off",
      }}
    />
  );
}

const pollyfill_language = (lang: string) => {
  switch (lang) {
    case "tsx":
      return "typescript";
    case "jsx":
      return "javascript";
    default:
      return lang;
  }
};

export { useMonaco } from "@monaco-editor/react";
