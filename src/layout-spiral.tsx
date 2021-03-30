import React from 'react';
import { fitWithin, IConfiguration } from './configuration';
import { SequenceData } from './data';
import { LayoutType } from './layout';

export interface ISpiralLayout {
  type: LayoutType.Spiral;
  colors: ReadonlyArray<string>;
  segmentHeight: number;
  segmentGutter: number;
  startRadius: number;
}

export const makeSpiralLayout = (
  config: IConfiguration,
  { segmentHeight, startRadius, segmentGutter, colors }: ISpiralLayout,
  data: SequenceData,
) => {
  const box = fitWithin(config.nodeRegion, 1);
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;

  const rollLength =
    (Math.PI * (Math.min(box.height, box.width) ** 2 / 4 - startRadius ** 2 / 4)) / segmentHeight;
  const lengthPerSegment = rollLength / data.length;

  const sh = segmentHeight - segmentGutter;
  let theta = 0;
  let ax = 1;
  let ay = 0;
  let radiusA = startRadius;

  return data.map((seq, i) => {
    const sweep = lengthPerSegment / radiusA;
    theta += sweep;

    const radiusB = radiusA + (sweep / (2 * Math.PI)) * segmentHeight;
    const bx = Math.cos(theta);
    const by = Math.sin(theta);
    const path = (
      <path
        key={i}
        fill={colors[seq]}
        d={
          `M ${cx + ax * radiusA} ${cy + ay * radiusA} ` +
          `A ${radiusB} ${radiusB} 0 0 1 ${cx + bx * radiusB} ${cy + by * radiusB} ` +
          `L ${cx + bx * (radiusB + sh)} ${cy + by * (radiusB + sh)} ` +
          `A ${radiusA + sh} ${radiusA + sh} 0 0 0 ` +
          `${cx + ax * (radiusA + sh)} ${cy + ay * (radiusA + sh)} ` +
          `L ${cx + ax * radiusA} ${cy + ay * radiusA}`
        }
      />
    );

    ax = bx;
    ay = by;
    radiusA = radiusB;

    return path;
  });
};
