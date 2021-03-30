import React from 'react';
import { IBox, IConfiguration } from './configuration';
import { Seq, SequenceData } from './data';
import { LayoutType } from './layout';

export const enum ColumnOrientation {
  Horizontal,
  Vertical,
}

export const enum ColumnNodeShape {
  Barcode,
  Circle,
}

export interface IColumnLayout {
  type: LayoutType.Column;
  foreground: string;
  count: number;
  orientation: ColumnOrientation;
  shape: ColumnNodeShape;
  spacing: number;
}

const box = (config: IColumnLayout, index: number, dataPoints: number, region: IBox) => {
  const perColumn = Math.ceil(dataPoints / config.count);
  const row = index % perColumn;
  const col = Math.floor(index / perColumn);

  if (config.orientation === ColumnOrientation.Vertical) {
    const cellHeight = region.height / perColumn;
    const cellWidth = (region.width - config.spacing * (config.count - 1)) / config.count;

    return {
      top: region.top + row * cellHeight,
      left: region.left + col * (cellWidth + config.spacing),
      width: cellWidth,
      height: cellHeight,
    };
  } else {
    const cellWidth = region.width / perColumn;
    const cellHeight = (region.height - config.spacing * (config.count - 1)) / config.count;

    return {
      top: region.top + col * (cellHeight + config.spacing),
      left: region.left + row * cellWidth,
      width: cellWidth,
      height: cellHeight,
    };
  }
};

export const makeColumnLayout = (
  config: IConfiguration,
  layout: IColumnLayout,
  data: SequenceData,
) => {
  const node = layout.shape === ColumnNodeShape.Circle ? CircleNode : RectNode;

  return data.map((seq, i) =>
    React.createElement(node, {
      key: i,
      box: box(layout, i, data.length, config.nodeRegion),
      seq,
      layout,
    }),
  );
};

type NodeType = React.FC<{ box: IBox; seq: Seq; layout: IColumnLayout }>;

const CircleNode: NodeType = ({ box, seq, layout }) => {
  let x: number;
  let y: number;
  let maxSize: number;
  if (layout.orientation === ColumnOrientation.Vertical) {
    maxSize = Math.min(box.height, box.width / 5);
    x = box.left + (box.width / 5) * (seq + 0.5);
    y = box.top + box.height / 2;
  } else {
    maxSize = Math.min(box.width, box.height / 5);
    y = box.top + (box.height / 5) * (seq + 0.5);
    x = box.left + box.width / 2;
  }

  return <circle cx={x} cy={y} r={maxSize / 3} />;
};

const RectNode: NodeType = ({ box, seq, layout }) => {
  if (layout.orientation === ColumnOrientation.Vertical) {
    const width = box.width / 4;
    return (
      <rect
        fill={layout.foreground}
        x={box.left + seq * width}
        y={box.top}
        width={width}
        height={box.height}
      />
    );
  } else {
    const height = box.height / 4;
    return (
      <rect
        fill={layout.foreground}
        x={box.left}
        y={box.top + seq * height}
        width={box.width}
        height={height}
      />
    );
  }
};
