import { ColiObjectLike, handle } from "@coli.codes/builder";
import { CSSProperties } from "@coli.codes/css";
import { ScopedVariableNamer } from "@coli.codes/naming";
import { WidgetWithStyle } from "@web-builder/core";
import { JSXAttributes, JSXIdentifier } from "coli";
import {
  declareStyledComponentVariable,
  NamePreference,
  StyledComponentDeclaration,
} from "./styled-component-declaration";

export interface StyledComponentJSXElementConfig {
  tag: JSXIdentifier;
  attributes?: JSXAttributes;
  style: CSSProperties;
  styledComponent: StyledComponentDeclaration;
}

export interface NoStyleJSXElementConfig {
  tag: JSXIdentifier;
  attributes?: JSXAttributes;
}

/**
 *
 * @param widget
 * @returns
 */
export function buildStyledComponentConfig(
  widget: WidgetWithStyle,
  preferences: {
    namer: ScopedVariableNamer;
    transformRootName: boolean;
    context: {
      root: boolean;
    };
  }
): StyledComponentJSXElementConfig | NoStyleJSXElementConfig {
  const config = widget.jsxConfig();

  const namePref: NamePreference = {
    namer: preferences.namer,
    overrideKeyName:
      preferences.context.root &&
      preferences.transformRootName &&
      "root wrapper " + widget.key.name, // RootWrapper${name}
  };

  const styledVar = declareStyledComponentVariable(widget, {
    name: namePref,
  });

  if (styledVar) {
    if (config.tag instanceof JSXIdentifier) {
      // rename tag as styled component
      // e.g. `div` to `Wrapper`
      config.tag.rename(styledVar.id.name);
    } else {
      console.error(
        `unhandled styled component conversion of widget type of ${typeof config}`,
        config
      );
    }

    return {
      tag: handle(config.tag),
      attributes: config.attributes,
      style: widget.styleData(),
      styledComponent: styledVar,
    };
  } else {
    return {
      tag: handle(config.tag),
      attributes: config.attributes,
    };
  }
}