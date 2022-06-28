import { ReservedKeywordPlatformPresets } from "@coli.codes/naming/reserved";
import {
  react as react_config,
  reactnative as reactnative_config,
} from "@designto/config";
import type { JsxWidget } from "@web-builder/core";
import { Framework } from "@grida/builder-platform-types";
import {
  react_imports,
  ReactWidgetModuleExportable,
} from "@web-builder/react-core";
import {
  buildJsx,
  StylesConfigMapBuilder,
  JSXWithoutStyleElementConfig,
  JSXWithStyleElementConfig,
  WidgetStyleConfigMap,
} from "@web-builder/core/builders";
import {
  BlockStatement,
  Identifier,
  ImportDeclaration,
  JSXAttribute,
  ObjectLiteralExpression,
  PropertyAssignment,
  Return,
  ScopedVariableNamer,
  TemplateLiteral,
} from "coli";
import { cssToJson } from "@web-builder/styles/_utils";
import { CSSProperties } from "@coli.codes/css";
import { reactnative_imports } from "..";
import { makeEsWidgetModuleFile } from "@web-builder/module-es";

/**
 * CSS In JS Style builder for React Framework
 *
 *
 * css in js is a pattern that allows you to use css as a object in jsx, to property `style`.
 *
 * ```tsx
 * // output be like...
 * <div style={{ color: "red" }}/>
 * ```
 *
 */
export class ReactNativeInlineStyleBuilder {
  private readonly entry: JsxWidget;
  private readonly widgetName: string;
  readonly config: reactnative_config.ReactNativeInlineStyleConfig;
  private readonly namer: ScopedVariableNamer;
  private readonly stylesMapper: StylesConfigMapBuilder;
  // private readonly stylesConfigWidgetMap: WidgetStyleConfigMap;

  constructor({
    entry,
    config,
  }: {
    entry: JsxWidget;
    config: reactnative_config.ReactNativeInlineStyleConfig;
  }) {
    this.entry = entry;
    this.widgetName = entry.key.name;
    this.config = config;
    this.namer = new ScopedVariableNamer(
      entry.key.id,
      ReservedKeywordPlatformPresets.react
    );

    this.stylesMapper = new StylesConfigMapBuilder(
      entry,
      {
        namer: this.namer,
        rename_tag: false,
      },
      Framework.reactnative
    );
  }

  private stylesConfig(
    id: string
  ): JSXWithStyleElementConfig | JSXWithoutStyleElementConfig {
    return this.stylesMapper.map.get(id);
  }

  private jsxBuilder(widget: JsxWidget) {
    return buildJsx(
      widget,
      {
        styledConfig: (id) => {
          const cfg = this.stylesConfig(id);
          const _default_attr = cfg.attributes;

          const existingstyleattr = _default_attr?.find(
            // where style refers to react-native's jsx style attribute
            (a) => a.name.name === "style"
          );

          let style: JSXAttribute;
          if (existingstyleattr) {
            // ignore this case. (element already with style attriibute may be svg element)
            // this case is not supported. (should supported if the logic changes)
          } else {
            //
            const styledata: CSSProperties =
              (cfg as JSXWithStyleElementConfig).style ?? {};
            const reactStyleData = cssToJson(styledata);
            const properties: PropertyAssignment[] = Object.keys(
              reactStyleData
            ).map(
              (key) =>
                new PropertyAssignment({
                  name: key as unknown as Identifier,
                  initializer: new TemplateLiteral(reactStyleData[key]),
                })
            );

            style = new JSXAttribute(
              "style",
              new BlockStatement(
                new ObjectLiteralExpression({
                  properties: properties,
                })
              )
            );
          }

          const newattributes = [
            ...(_default_attr ?? []),
            //
            style,
          ];

          cfg.attributes = newattributes;

          return cfg;
        },
      },
      {
        self_closing_if_possible: true,
      }
    );
  }

  partImports() {
    return [
      react_imports.import_react_from_react,
      reactnative_imports.import_react_prepacked,
    ];
  }

  partBody(): BlockStatement {
    let jsxTree = this.jsxBuilder(this.entry);
    return new BlockStatement(new Return(jsxTree));
  }

  asExportableModule() {
    const body = this.partBody();
    const imports = this.partImports();
    return new ReactNativeInlineStyleWidgetModuleExportable(this.widgetName, {
      body,
      imports,
    });
  }
}

export class ReactNativeInlineStyleWidgetModuleExportable extends ReactWidgetModuleExportable {
  constructor(
    name,
    {
      body,
      imports,
    }: {
      body: BlockStatement;
      imports: ImportDeclaration[];
    }
  ) {
    super({
      name,
      body,
      imports,
    });
  }

  asFile({
    exporting,
  }: {
    exporting: react_config.ReactComponentExportingCofnig;
  }) {
    return makeEsWidgetModuleFile({
      name: this.name,
      path: "src/components",
      imports: this.imports,
      declarations: [],
      body: this.body,
      config: {
        exporting: exporting,
      },
    });
  }
}
