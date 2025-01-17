import React from "react";
import { color_layer_highlight } from "../theme";

export function OulineSide({
  wh,
  orientation,
  zoom,
  width = 1,
  box,
  color = color_layer_highlight,
  readonly = true,
  cursor,
}: {
  wh: [number, number];
  box: [number, number, number, number];
  zoom: number;
  orientation: "w" | "n" | "e" | "s";
  width?: number;
  color?: string;
  readonly?: boolean;
  cursor?: React.CSSProperties["cursor"];
}) {
  const d = 100;
  const [w, h] = wh;

  // is vertical line
  const isvert = orientation === "w" || orientation === "e";
  const l_scalex = isvert ? width / d : (w / d) * zoom;
  const l_scaley = isvert ? (h / d) * zoom : width / d;

  let trans = { x: 0, y: 0 };
  switch (orientation) {
    case "w": {
      trans = {
        x: box[0] - d / 2,
        y: box[1] + (d * l_scaley - d) / 2,
      };
      break;
    }
    case "e": {
      trans = {
        x: box[2] - d / 2,
        y: box[1] + (d * l_scaley - d) / 2,
      };
      break;
    }
    case "n": {
      trans = {
        x: box[0] + (d * l_scalex - d) / 2,
        y: box[1] - d / 2,
      };
      break;
    }
    case "s": {
      trans = {
        x: box[0] + (d * l_scalex - d) / 2,
        y: box[3] - d / 2,
      };
      break;
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        width: d,
        height: d,
        opacity: 1,
        pointerEvents: readonly ? "none" : "all",
        cursor: cursor,
        willChange: "transform",
        transform: `translate3d(${trans.x}px, ${trans.y}px, 0) scaleX(${l_scalex}) scaleY(${l_scaley})`,
        backgroundColor: color,
      }}
    />
  );
}
