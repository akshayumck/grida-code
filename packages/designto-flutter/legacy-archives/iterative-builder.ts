import { nodes } from "@design-sdk/core";
import { TextBuilder, WidgetBuilder } from "../widget-builders";
import * as flutter from "@flutter-builder/flutter";
import { makeSafelyAsStackList } from "../utils/make-as-safe-list";
import { makeFlutterDivider } from "../make/make-flutter-divider";
import { detectIf } from "@reflect-ui/detection";
import { makeFlatButton } from "../make/make-flutter-flat-button";
import { makeDetectedIcon } from "../make/make-flutter-icon";
import { makeIllustImage } from "../make/make-flutter-image";
import { makeRowColumn } from "../make/make-flutter-column-row";
import { makeStack } from "../make/make-flutter-stack";
import { Axis as ReflectAxis } from "@reflect-ui/core";
import { makeChip } from "../make/make-flutter-chip";
import { array, roundNumber } from "@reflect-ui/uiutils";
import { output } from "@grida/builder-config";
import { tokenizeDivider } from "@designto/token";

type FlutterScreenOutput = output.ScreenOutput<flutter.Widget>;

let parentId = "";

// the target root widget tree
let targetId: string;
let scrollable: boolean;
export function buildApp(
  sceneNode: nodes.ReflectSceneNode
): FlutterScreenOutput {
  scrollable = true; // init to true.
  targetId = sceneNode.id;
  const rootWidget = generateRootWidget(sceneNode);
  console.log("flutter widget build result is..", rootWidget);
  return {
    widget: rootWidget,
    scrollable: scrollable,
  };
}

function generateRootWidget(
  sceneNode: nodes.ReflectSceneNode,
  parentIdSrc: string = ""
): flutter.Widget {
  parentId = parentIdSrc;
  _log_current_node(sceneNode);
  let result = flutterWidgetGenerator(sceneNode);

  if (Array.isArray(result)) {
    // this won't happen
    throw "result cannot be in array form.";
  }

  return result;
}

function flutterWidgetGenerator(
  sceneNode: ReadonlyArray<nodes.ReflectSceneNode> | nodes.ReflectSceneNode
): Array<flutter.Widget> | flutter.Widget {
  console.log(`flutterWidgetGenerator handling scene node -`, sceneNode);
  if (Array.isArray(sceneNode) && sceneNode.length > 0) {
    // explicit type casting
    sceneNode = sceneNode as ReadonlyArray<nodes.ReflectSceneNode>;

    // count of input nodes
    const sceneLen = sceneNode.length;

    // initialize output widgets array
    let widgets: Array<flutter.Widget> = [];

    console.log(
      `widget generator::
      targetting list of nodes children of parent:{${sceneNode[0].parent?.toString()}}.
      total count of ${sceneLen}`
    );

    sceneNode.forEach((node, index) => {
      _log_current_node(node);
      widgets.push(handleNode(node));

      // if the parent is an AutoLayout, and itemSpacing is set, add a SizedBox between items.
      widgets.push(addSpacingIfNeeded(node, index, sceneLen));
    });

    // filter empty widgets
    widgets = widgets.filter((w) => array.filters.notEmpty(w));
    if (widgets.length == 1) {
      // TODO - inspect this logic - is it safe?
      // console.log("flutterWidgetGenerator complete", widgets[0])
      return widgets[0];
    }
    // console.log("flutterWidgetGenerator complete", widgets)
    return widgets;
  } else {
    // explicit type casting
    sceneNode = sceneNode as nodes.ReflectSceneNode;
    console.log(
      `widget generator::
      targetting single node ${sceneNode.toString()}
      this is child of ${sceneNode.parent?.toString()}`
    );

    return handleNode(sceneNode);
  }

  function handleNode(node: nodes.ReflectSceneNode): flutter.Widget {
    _log_current_node(node);
    console.log(
      `starting handling node ${node.toString()} type of ${node.type}`
    );

    const chipDetectionResult = detectIf.chip(node);
    if (chipDetectionResult.result) {
      console.log("detected:: this node is detected as Chip", node.name);
      return makeChip(chipDetectionResult.data);
    }

    const buttonDetectionResult = detectIf.button(node);
    if (buttonDetectionResult.result) {
      console.log("detected:: this node is detected as button.", node.name);
      return makeFlatButton(buttonDetectionResult.data);
    }

    const iconDetectionResult = detectIf.icon(node);
    if (iconDetectionResult.result) {
      console.log("detected:: this node is detected as an icon.", node.name);
      return makeDetectedIcon(iconDetectionResult.data);
    }

    const illustDetectionResult = detectIf.illust(node);
    if (illustDetectionResult.result) {
      console.log("detected:: this node is detected as an illust.", node.name);
      return makeIllustImage(node);
    }

    if (
      node instanceof nodes.ReflectRectangleNode ||
      node instanceof nodes.ReflectEllipseNode
    ) {
      console.log(
        `this node ${node.toString()} is a rect || ellipse. making it as a empty container`
      );
      return flutterContainer(node, undefined);
    } else if (node instanceof nodes.ReflectLineNode) {
      const _divider_detection_result = detectIf.divider(node);
      if (_divider_detection_result.result) {
        console.log(
          `this node ${node.toString()} is a line. making it as a divider`
        );
        const dividerwidget = tokenizeDivider.fromManifest(
          node,
          _divider_detection_result.data
        );
        return makeFlutterDivider(dividerwidget);
      }
    } else if (node instanceof nodes.ReflectGroupNode) {
      console.log(
        `this node ${node.toString()} is a group. handling with group handler`
      );
      return flutterGroupHandler(node);
    } else if (node instanceof nodes.ReflectFrameNode) {
      return flutterFrame(node);
    } else if (node instanceof nodes.ReflectTextNode) {
      return flutterText(node);
    }
  }
}

function _log_current_node(node: { id: string }) {
  // console.log(
  //   `
  //   ----------
  //   flutter app generation: targetting current processing node to ${node.id}
  //   ----------
  //   `
  // );
}

function flutterGroupHandler(node: nodes.ReflectGroupNode): flutter.Widget {
  // console.log(
  //   `group handler :: making ${node} as a stack with its children count of ${node.childrenCount}`
  // );

  return flutterContainer(
    node,
    makeStack(flutterWidgetGenerator(node.children) as [])
  );
}

function flutterContainer(
  node:
    | nodes.ReflectFrameNode
    | nodes.ReflectGroupNode
    | nodes.ReflectRectangleNode
    | nodes.ReflectEllipseNode,
  child?: flutter.Widget
): flutter.Widget {
  const builder = new WidgetBuilder({ child: child, node: node });

  const isBuildRoot = targetId === node.id;
  const sizeOptions = isBuildRoot
    ? {
        size: new flutter.Size(
          flutter.MediaQuery.of().size.width,
          undefined
        ).addComment(
          'container building for target root node. making the width with "MediaQuery.of().size.width"'
        ),
      }
    : undefined;

  builder
    .wrapWithContainer(sizeOptions)
    .blendWithAttributes()
    .positionInParent(parentId);
  return builder.child;
}

function flutterText(node: nodes.ReflectTextNode): flutter.Widget {
  const builder = new TextBuilder({
    child: undefined,
    node: node,
  });

  builder.createText().blendWithAttributes().positionInParent(parentId);

  return builder.child;
}

function flutterFrame(node: nodes.ReflectFrameNode): flutter.Widget {
  // console.log(`start handling frame node ${node.toString()} and its children`);

  const children = flutterWidgetGenerator(node.children);

  if (node.children.length === 1) {
    // if there is only one child, there is no need for Container or Row. Padding works indepdently of them.
    return flutterContainer(node, children as flutter.Widget);
  } else if (node.layoutMode !== undefined) {
    const rowColumn = makeRowColumn(node, children as Array<flutter.Widget>);
    return flutterContainer(node, rowColumn);
  } else {
    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute

    // region
    // if currently handled node is root node, and it's outcome is stack, then make it not scrollable. (singlechildscrollview with stack usage is not resolved, remaining as issue.)
    if (node.id == targetId) {
      scrollable = false;
    }
    // endregion

    return flutterContainer(
      node,
      new flutter.Stack({
        children: makeSafelyAsStackList(children),
      })
    );
  }
}

function addSpacingIfNeeded(
  node: nodes.ReflectSceneNode,
  index: number,
  length: number
): flutter.Widget | undefined {
  if (
    node.parent instanceof nodes.ReflectFrameNode &&
    node.parent.layoutMode !== undefined
  ) {
    // check if itemSpacing is set and if it isn't the last value.
    // Don't add the SizedBox at last value. In Figma, itemSpacing CAN be negative; here it can't.
    if (node.parent.itemSpacing > 0 && index < length - 1) {
      if (node.parent.layoutMode === ReflectAxis.horizontal) {
        return new flutter.SizedBox({
          width: roundNumber(node.parent.itemSpacing),
        });
      } else {
        // node.parent.layoutMode === "VERTICAL"
        return new flutter.SizedBox({
          height: roundNumber(node.parent.itemSpacing),
        });
      }
    }
  }
  return undefined;
}

export * from "../make/make-flutter-material-app";
