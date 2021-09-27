import { Widget, IMultiChildWidget } from ".";
import { JSXAttributes, JSXIdentifier } from "coli";
import { CSSProperties } from "@coli.codes/css";
import { ColiObjectLike } from "@coli.codes/builder";
import {
  Color,
  DimensionLength,
  EdgeInsets,
  IBoxShadowWidget,
  IEdgeInsetsWidget,
  IPositionedWidget,
  IWHStyleWidget,
} from "@reflect-ui/core";
import { BoxShadowManifest } from "@reflect-ui/core/lib/box-shadow";
import { Background } from "@reflect-ui/core/lib/background";
import { WidgetKey } from "../widget-key";
import { positionAbsolute } from "@web-builder/styles";

export interface JSXElementConfig {
  tag: ColiObjectLike<JSXIdentifier>;
  attributes?: JSXAttributes;
}

export interface IWidgetWithStyle {
  styleData(): CSSProperties;
  jsxConfig(): JSXElementConfig;
}

/**
 * Since html based framework's widget can be represented withou any style definition, this WidgetWithStyle class indicates, that the sub instance of this class will contain style data within it.
 */
export abstract class WidgetWithStyle
  extends Widget
  implements
    IWHStyleWidget,
    IPositionedWidget,
    IBoxShadowWidget,
    IEdgeInsetsWidget {
  width?: number;
  height?: number;

  constraint?: {
    left?: DimensionLength;
    top?: DimensionLength;
    right?: DimensionLength;
    bottom?: DimensionLength;
  };

  background?: Background;
  color?: Color;

  // IPositionWidget
  x?: number;
  y?: number;

  // IBoxShadowWidget
  boxShadow?: BoxShadowManifest;

  // IEdgeInsetsWidget
  margin?: EdgeInsets;
  padding?: EdgeInsets;

  /**
   * if the style is null, it means don't make element as a styled component at all. if style is a empty object, it means to make a empty styled component.
   * @internal - use .style for accessing the full style data.
   */
  abstract styleData(): CSSProperties | null;
  get style() {
    return {
      ...this.styleData(),
      /**
       * // FIXME: position shall not be specified when parent has a layout. (e.g. under flex)
       */
      ...((this.constraint && positionAbsolute(this.constraint)) || {}),
      // --------------------------------------------------------------------
      // ALWAYS ON BOTTOM
      // extended to override
      ...this.extendedStyle,

      // --------------------------------------------------------------------
    };
  }

  abstract jsxConfig(): JSXElementConfig;

  private extendedStyle: CSSProperties = {};
  extendStyle(style: CSSProperties) {
    this.extendedStyle = {
      ...this.extendedStyle,
      ...style,
    };
  }
}

/**
 * Since html based framework's widget can be represented withou any style definition, this WidgetWithStyle class indicates, that the sub instance of this class will contain style data within it.
 */
export abstract class MultiChildWidgetWithStyle
  extends WidgetWithStyle
  implements IWidgetWithStyle, IMultiChildWidget {
  readonly children: Array<WidgetWithStyle> = [];

  constructor({ key }: { key: WidgetKey }) {
    super({ key: key });
  }
  abstract styleData(): CSSProperties;

  abstract jsxConfig(): JSXElementConfig;
}
