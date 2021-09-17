import { MainAxisSize } from "@bridged.xyz/flutter-builder";
import { FigmaLayoutGrow } from "@design-sdk/figma-types";

export function interpretMainAxisSize(
  layoutGrow: FigmaLayoutGrow
): MainAxisSize {
  if (layoutGrow === 0) {
    return MainAxisSize.min;
  } else {
    return MainAxisSize.max;
  }
}
